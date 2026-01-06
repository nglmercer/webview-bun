@echo off
echo Looking for vswhere.exe...
set "vswhere=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
if not exist "%vswhere%" set "vswhere=%ProgramFiles%\Microsoft Visual Studio\Installer\vswhere.exe"
if not exist "%vswhere%" (
	echo ERROR: Failed to find vswhere.exe
	exit /b 1
)
echo Found %vswhere%

echo Looking for VC...
for /f "usebackq tokens=*" %%i in (`"%vswhere%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do (
  set vc_dir=%%i
)
if not exist "%vc_dir%\Common7\Tools\vsdevcmd.bat" (
	echo ERROR: Failed to find VC tools x86/x64
	exit /b 1
)
echo Found %vc_dir%

call "%vc_dir%\Common7\Tools\vsdevcmd.bat" -arch=x64 -host_arch=x64
cd %~dp0..\webview

REM Get absolute path to the build directory for WebView2 includes
for /f "delims=" %%i in ('cd') do set BUILD_ABS_PATH=%%i
set WEBVIEW2_INCLUDE=%BUILD_ABS_PATH%\build\webview2_nuget\build\native\include

REM Create include directory if it doesn't exist
if not exist "%WEBVIEW2_INCLUDE%" (
    echo ERROR: WebView2 headers not found at %WEBVIEW2_INCLUDE%
    echo Please run: curl -L -o webview\nuget.zip https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.1150.38
    echo        unzip -q nuget.zip -d build\webview2_nuget
    exit /b 1
)

echo.
echo Configuring CMake...
echo.

cmake -G Ninja -B build -S . ^
	-DWEBVIEW_ENABLE_CHECKS=false ^
	-DWEBVIEW_BUILD_AMALGAMATION=false ^
	-DWEBVIEW_BUILD_EXAMPLES=false ^
	-DWEBVIEW_BUILD_STATIC_LIBRARY=false ^
	-DWEBVIEW_BUILD_TESTS=false ^
	-DWEBVIEW_BUILD_DOCS=false ^
	-DWEBVIEW_USE_BUILTIN_MSWEBVIEW2=OFF ^
	-DCMAKE_CXX_FLAGS="-I%WEBVIEW2_INCLUDE%"

if %ERRORLEVEL% neq 0 (
	echo ERROR: CMake configuration failed
	exit /b 1
)

echo.
echo Building webview library...
echo.

cmake --build build --config Release

if %ERRORLEVEL% neq 0 (
	echo ERROR: Build failed
	exit /b 1
)

echo.
echo Build completed successfully!
echo.

if exist build\core\webviewd.dll (
	echo Built library: build\core\webviewd.dll
	if not exist ..\build mkdir ..\build
	copy /Y build\core\webviewd.dll ..\build\libwebview.dll
) else (
	echo ERROR: webview.dll was not found
	exit /b 1
)
