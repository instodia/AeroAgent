$port = 3000
$ip = [System.Net.IPAddress]::Loopback
$listener = New-Object System.Net.Sockets.TcpListener($ip, $port)

try {
    $listener.Start()
    Write-Host "Local AeroAgent HTTP Server running at http://localhost:$($port)/"
} catch {
    Write-Error ("Failed to start server on port " + $port + ": " + $_)
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
}

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        $buffer = New-Object byte[] 4096
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        
        if ($bytesRead -gt 0) {
            $requestText = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
            $firstLine = $requestText.Split("`n")[0].Trim()
            $parts = $firstLine.Split(" ")
            
            $rawPath = "/"
            if ($parts.Length -ge 2) {
                $rawPath = $parts[1]
            }
            
            $queryIndex = $rawPath.IndexOf('?')
            if ($queryIndex -ge 0) {
                $rawPath = $rawPath.Substring(0, $queryIndex)
            }
            
            if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq "/") {
                $rawPath = "/index.html"
            }
            
            $decodedPath = [System.Uri]::UnescapeDataString($rawPath.TrimStart('/'))
            $targetPath = Join-Path (Get-Location) $decodedPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            
            if (Test-Path $targetPath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($targetPath).ToLower()
                $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $fileBytes = [System.IO.File]::ReadAllBytes($targetPath)
                
                $headers = "HTTP/1.1 200 OK`r`n" +
                           "Content-Type: $contentType`r`n" +
                           "Content-Length: $($fileBytes.Length)`r`n" +
                           "Connection: close`r`n" +
                           "Access-Control-Allow-Origin: *`r`n" +
                           "`r`n"
                $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
                
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($fileBytes, 0, $fileBytes.Length)
                $stream.Flush()
            } else {
                $notFoundBody = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>File not found</p>")
                $headers = "HTTP/1.1 404 Not Found`r`n" +
                           "Content-Type: text/html; charset=utf-8`r`n" +
                           "Content-Length: $($notFoundBody.Length)`r`n" +
                           "Connection: close`r`n" +
                           "`r`n"
                $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($notFoundBody, 0, $notFoundBody.Length)
                $stream.Flush()
            }
        }
        
        $client.Close()
    } catch {
        # Loop continues gracefully
    }
}
