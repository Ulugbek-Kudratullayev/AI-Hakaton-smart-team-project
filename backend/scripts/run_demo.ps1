param(
    [string]$HostAddress = "127.0.0.1",
    [int]$Port = 8000
)

$python = "python"
if (Test-Path "..\.venv312\Scripts\python.exe") {
    $python = "..\.venv312\Scripts\python.exe"
} elseif (Test-Path ".\.venv\Scripts\python.exe") {
    $python = ".\.venv\Scripts\python.exe"
}

& $python scripts\demo_setup.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $python -m uvicorn app.main:app --host $HostAddress --port $Port --reload
