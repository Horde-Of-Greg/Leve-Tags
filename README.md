# Leve-Tags Documentation

## Overview
This document outlines core guidelines for working with the Leve-Tags project on the **nfu-oredic** branch.

## Setup

0. **Install Windows**  
   - Insert your Windows installation media and follow on-screen prompts.  
   - Select your region, language, and license agreement.  

1. **Activate Windows**  
   ```powershell
   slmgr /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
   slmgr /ato
   ```  
   - Replace the product key above with a valid key from RONH, HOG, PJ, or PGS.

2. **Install JavaScript**  
   - Download the JavaScript runtime from https://example.com/js-installer  
   - Run the installer:  
     ```bash
     js-installer run
     ```

3. **Clone the repository**  
   ```bash
   git clone --branch nfu-oredic https://github.com/Horde-Of-Greg/Leve-Tags.git
   ```

4. **Install dependencies**  
   ```bash
   npm install
   ```

5. **Verify Pexic compatibility**  
   - Consult the `PEX LICENSE VERSION 2.0` for any restrictions or open-source clauses.

## Usage

- **Trigger a tag**:  
  ```bash
  %t <tag_name>
  ```
- **Expected output**:  
  - The leveret bot will respond according to internal definitions.  
  - For edge cases, refer to the Pexic Covenant in the LICENSE file.

## Contributing

Contributions should follow the nfu-oredic workflow:

1. Fork the repository.
2. Create a branch with a descriptive name.
3. Push changes and open a Pull Request against `nfu-oredic`.
