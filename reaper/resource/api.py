from fastapi import FastAPI, Header, HTTPException # Keep HTTPException for other errors if needed
from pydantic import BaseModel, field_validator
from doltcli.dolt import Dolt, DoltException
from typing import List, Optional # For Optional fields

DB_PATH = r"C:/Users/battl/Documents/resource_db"
app = FastAPI(title="Resource DB")

class Req(BaseModel):
    slug: str
    title: str | None = None
    body: str

    @field_validator('slug', 'title', 'body', mode='before')
    @classmethod
    def strip_str(cls, value: str | None) -> str | None:
        if isinstance(value, str): return value.strip()
        return value

# Unified Response Model for /resource/{slug}
class UnifiedResourceResponse(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    attribution: Optional[str] = None
    last_reviewed: Optional[str] = None
    error: Optional[str] = None # Field to indicate an error

# Search models remain the same as they have their own error handling path if needed
class SearchResultItem(BaseModel):
    slug: str
    title: str
    snippet: str | None = None

class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
    count: int
    error: Optional[str] = None # Can add error field here too if needed


def get_conn(branch: str = "main") -> Dolt:
    db = Dolt(DB_PATH)
    if db.active_branch != branch:
        try:
            db.checkout(branch)
        except DoltException as e:
            # This internal error should still probably raise an HTTPException
            # because it's a server-side issue, not a "resource not found"
            active_branch_name = "unknown"
            try: active_branch_name = db.active_branch
            except Exception: pass
            if "would be overwritten by checkout" in str(e).lower():
                # This is a server state error, 500 or 409 is appropriate
                raise HTTPException(
                    status_code=409, 
                    detail=f"Repository is in a dirty state on branch '{active_branch_name}'. Please clean or commit changes."
                )
            # For other DoltExceptions during checkout, a 500 is fine.
            raise HTTPException(status_code=500, detail=f"Dolt Error: Could not checkout branch '{branch}'. {e}")
    return db

def sql_escape(text: str) -> str:
    return text.replace("'", "''")

def as_row_list(out) -> list[dict]:
    if isinstance(out, list): return out
    if isinstance(out, dict):
        if "rows" in out and isinstance(out["rows"], list): return out["rows"]
        return list(out.values()) # This fallback might be an issue if `out` isn't a list of dicts for single row JSON
    return []

@app.get("/resource/{slug}", response_model=UnifiedResourceResponse) # Use the unified model
def read_resource(slug: str):
    db  = get_conn("main") # get_conn can still raise HTTPExceptions for server issues
    
    # The SQL query itself should not error if the table/columns exist.
    # It will just return 0 rows if no match.
    out = db.sql(
        "SELECT slug, title, body_md, author_id, reviewed_ts FROM resources "
        f"WHERE slug_lower = LOWER('{sql_escape(slug)}') AND approved = TRUE;",
        result_format="json"
    )
    rows = as_row_list(out)

    if not rows:
        # Return the UnifiedResourceResponse structure with the error field populated
        return UnifiedResourceResponse(error=f"Resource '{slug}' not found or not approved.")

    r = rows[0]
    return UnifiedResourceResponse(
        slug=r.get("slug"),
        title=r.get("title", "N/A"),
        body=r.get("body_md", ""),
        attribution=r.get("author_id"),
        last_reviewed=r.get("reviewed_ts")
        # error field will be None/omitted by default
    )

@app.get("/search/resources", response_model=SearchResponse)
def search_resources(q: str | None = None):
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query 'q' is required and must be at least 2 characters long.")

    db = get_conn("main") # Search is on the main branch
    
    original_user_query = q.strip()
    # Prepare search term for case-insensitive LIKE with wildcards
    query_term_for_like = f"%{sql_escape(original_user_query.lower())}%" 

    # SQL query using LIKE for case-insensitive search
    search_sql = (
        "SELECT slug, title, body_md FROM resources "
        f"WHERE (LOWER(title) LIKE '{query_term_for_like}' OR LOWER(body_md) LIKE '{query_term_for_like}') "
        "AND approved = TRUE "
        "ORDER BY title ASC " # Simple alphabetical order by title
        "LIMIT 20;" 
    )
    
    search_output = db.sql(search_sql, result_format="json")
    raw_results = as_row_list(search_output)

    results_list: list[SearchResultItem] = []
    for r_dict in raw_results:
        title = r_dict.get("title", "N/A")
        body = r_dict.get("body_md", "") 
        slug = r_dict.get("slug", "N/A")

        # SIMPLIFIED Snippet Generation (First 10 words of body, or title)
        snippet = None
        if body:
            words = body.split()
            first_few_words = " ".join(words[:10])
            if len(words) > 10 or len(first_few_words) > 97 :
                snippet = first_few_words[:97] + "..."
            else:
                snippet = first_few_words + ("..." if len(words) > 10 else "")

        elif title: 
            snippet = (title[:97] + "...") if len(title) > 100 else title
        else:
            snippet = "N/A"
        
        results_list.append(SearchResultItem(slug=slug, title=title, snippet=snippet))

    return SearchResponse(query=original_user_query, results=results_list, count=len(results_list))


# /suggest and /edit endpoints already return a JSON dict with an "error" or "msg" key,
# which is the pattern you want. So, no changes needed there for this specific request.
# They implicitly return 200 OK.

@app.post("/suggest")
def suggest(req: Req, x_user_id: str = Header(...)):
    # ... (no changes to internal logic, already returns {"error": ...} or {"msg": ...})
    slug_raw   = req.slug
    slug_lower = slug_raw.lower()
    db_main = get_conn("main")
    exists_main_approved_sql = (
        f"SELECT 1 FROM resources WHERE slug_lower = '{sql_escape(slug_lower)}' AND approved = TRUE LIMIT 1;")
    if as_row_list(db_main.sql(exists_main_approved_sql, result_format="json")):
        return {"error": f"🔒 An approved resource named '{slug_raw}' already exists."} # This is already a dict
    db_pend = get_conn("pending")
    exists_pend_sql = (f"SELECT 1 FROM resources WHERE slug_lower = '{sql_escape(slug_lower)}' LIMIT 1;")
    if as_row_list(db_pend.sql(exists_pend_sql, result_format="json")):
        return {"error": f"⏳ '{slug_raw}' is already in the review queue."}
    title_to_insert = req.title if req.title else slug_raw
    query = (
        "REPLACE INTO resources (slug, slug_lower, title, body_md, author_id, approved) "
        f"VALUES ('{sql_escape(slug_raw)}', '{sql_escape(slug_lower)}', "
        f"        '{sql_escape(title_to_insert)}', '{sql_escape(req.body)}', "
        f"        '{sql_escape(x_user_id)}', FALSE)"
    )
    db_pend.sql(query)
    db_pend.add(["resources"])
    db_pend.commit(f"suggestion by {x_user_id}: {slug_raw}")
    return {"msg": "✅ Suggestion queued for review."} # This is already a dict

@app.post("/edit")
def edit(req: Req, x_user_id: str = Header(...)):
    # ... (no changes to internal logic, already returns {"error": ...} or {"msg": ...})
    slug_raw   = req.slug
    slug_lower = slug_raw.lower()
    db_main = get_conn("main")
    existing_row_sql = (
        f"SELECT slug, title FROM resources WHERE slug_lower = '{sql_escape(slug_lower)}' AND approved = TRUE LIMIT 1;")
    existing_list = as_row_list(db_main.sql(existing_row_sql, result_format="json"))
    if not existing_list:
        return {"error": f"❌ No approved resource named '{slug_raw}' to edit."}
    original_main_slug = existing_list[0]["slug"]; original_main_title = existing_list[0]["title"]
    title_for_edit = req.title if req.title else original_main_title
    db_pend = get_conn("pending")
    query = (
        "REPLACE INTO resources (slug, slug_lower, title, body_md, author_id, approved) "
        f"VALUES ('{sql_escape(slug_raw)}', '{sql_escape(slug_lower)}', "
        f"        '{sql_escape(title_for_edit)}', '{sql_escape(req.body)}', "
        f"        '{sql_escape(x_user_id)}', FALSE)"
    )
    db_pend.sql(query)
    db_pend.add(["resources"])
    db_pend.commit(f"edit by {x_user_id}: {slug_raw} (original main slug: {original_main_slug})")
    return {"msg": f"✏️ Edit queued for '{slug_raw}'. Awaiting review."}