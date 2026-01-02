$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$javaPath = "C:\Program Files\Java\jdk-17"
$cmdlineToolsPath = "$sdkPath\cmdline-tools\latest\bin"
$platformToolsPath = "$sdkPath\platform-tools"

Write-Host "Configuring Android SDK at: $sdkPath"
Write-Host "Configuring JAVA_HOME at: $javaPath"

# Set persistently for the user
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdkPath, "User")
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")

# Add to current session PATH
$env:PATH = "$javaPath\bin;$cmdlineToolsPath;$platformToolsPath;" + $env:PATH
$env:JAVA_HOME = $javaPath
$env:ANDROID_HOME = $sdkPath

Write-Host "Accepting licenses..."
# Auto-accept all licenses
Write-Output "y" | & "$cmdlineToolsPath\sdkmanager.bat" --licenses

Write-Host "SDK and Java environment configured for this session."
