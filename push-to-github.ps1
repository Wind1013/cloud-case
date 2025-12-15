# PowerShell script to push code to GitHub for the first time
# Make sure Git is installed before running this script
# Download Git from: https://git-scm.com/download/win

Write-Host "🚀 Initializing Git repository and pushing to GitHub..." -ForegroundColor Cyan

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

# Initialize git repository (if not already initialized)
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Cyan
    git init
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Add remote (will set or update the remote)
Write-Host "🔗 Setting up remote repository..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin https://github.com/crisvin03/cloud-case.git
Write-Host "✅ Remote 'origin' set to https://github.com/crisvin03/cloud-case.git" -ForegroundColor Green

# Stage all files
Write-Host "📝 Staging all files..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Committing changes..." -ForegroundColor Cyan
    git commit -m "Initial commit: Cloud Case Management System"
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
}

# Check current branch
$branch = git branch --show-current
if (-not $branch) {
    Write-Host "🌿 Creating main branch..." -ForegroundColor Cyan
    git branch -M main
    $branch = "main"
}

Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "   Repository: https://github.com/crisvin03/cloud-case.git" -ForegroundColor Gray
Write-Host "   Branch: $branch" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  You may be prompted for your GitHub credentials." -ForegroundColor Yellow
Write-Host "   If you use 2FA, you'll need to use a Personal Access Token as your password." -ForegroundColor Yellow
Write-Host "   Get a token from: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host ""

# Push to GitHub
git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 View your repository at: https://github.com/crisvin03/cloud-case" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check the error messages above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Authentication failed: Use a Personal Access Token instead of password" -ForegroundColor Yellow
    Write-Host "  - Repository doesn't exist: Make sure the repository exists on GitHub" -ForegroundColor Yellow
    Write-Host "  - Network issues: Check your internet connection" -ForegroundColor Yellow
}

