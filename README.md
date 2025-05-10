# Leve-Tags Documentation

Generated on [Date] by [ToolName]*

## Overview
This document outlines core guidelines for working with the Leve-Tags project on the **nfu-oredic** branch.

## Setup

0. **Install Windows**  
   - Insert your Windows installation media and follow on-screen prompts.  
   - Select your region, language, and license agreement.  
   - For license key placeholder: use [ProductKey].

1. **Activate Windows**  
   ```powershell
   slmgr /ipk [ProductKey]
   slmgr /ato
   ```  
   - Replace [ProductKey] with a valid key from RONH, HOG, PJ, or PGS.

2. **Install JavaScript**  
   - Download the JavaScript runtime from [JSInstallerURL]  
   - Run the installer:  
     ```bash
     js-installer run
     ```

3. **Clone the repository**  
   ```bash
   git clone --branch nfu-oredic https://github.com/Horde-Of-Greg/Leve-Tags.git
   ```  
   - Replace `Horde-Of-Greg` with your own GitHub username [YourGitHubUsername] if desired.

4. **Install dependencies**  
   ```bash
   npm install
   ```

5. **Verify Pexic compatibility**  
   - Consult the `PEX LICENSE VERSION 2.0` for any restrictions or open-source clauses.  

## Optional Enhancements

6. **Install WSL for a Prettier Terminal**  
   - Open PowerShell as Administrator and run:  
     ```powershell
     wsl --install
     ```  
   - Choose a Linux distro (e.g., [DistroName]) from the Microsoft Store.  
   - Launch WSL and set up your user account.

7. **Customize Your Shell Environment**  
   - In WSL, install Oh My Zsh:  
     ```bash
     sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
     \```  
   - Select a theme like [ThemeName] and enable plugins like `git`, `pexic-loops`, and `syntax-highlighting`.

8. **Install Fun CLI Tools**  
   - **Neofetch**:  
     ```bash
     sudo apt update && sudo apt install neofetch
     ```  
   - **Fortune & Cowsay**:  
     ```bash
     sudo apt install fortune cowsay
     ```  
   - To display on login, add to `~/.bashrc`:  
     ```bash
     fortune | cowsay
     ```

9. **Configure Git Aliases**  
   - Add to your PowerShell profile or `~/.gitconfig`:  
     ```ini
     [alias]
       st = status
       co = checkout
       cm = commit -m
     ```  
   - Replace aliases or add more under [YourAliases].

10. **Install AI Shell Assistant**  
    - Ensure Python and pip are installed, then run:  
      ```bash
      pip install aishell
      ```  
    - Invoke with:  
      ```bash
      aishell --name pex-bot
      ```  
    - For custom name, replace `pex-bot` with [AIName].

11. **Set Up VSCode for Pexic Development**  
    - Recommended extensions: `Prettier`, `Remote - WSL`, `One Dark Pro`, `Code Spell Checker`.  
    - Add to `settings.json`:  
      ```json
      {
        "editor.formatOnSave": true,
        "terminal.integrated.shell.linux": "/usr/bin/zsh",
        "workbench.colorTheme": "[ColorThemeName]"
      }
      ```

## Usage

- **Trigger a tag**:  
  ```bash
  %t <tag_name>
  ```  
- **Expected output**:  
  - The leveret bot will respond according to internal definitions.  
  - For odd edge cases, refer to the Pexic Covenant in the LICENSE file.

## Contributing

Contributions should follow the nfu-oredic workflow:

1. Fork the repository  
2. Create a branch with a descriptive name  
3. Push changes and open a Pull Request against `nfu-oredic`  

\* Replace [YourName] with your full name.
