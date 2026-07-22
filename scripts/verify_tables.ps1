$keyLine = (Get-Content .env.local | Select-String 'NEXT_PUBLIC_SUPABASE_ANON_KEY').ToString()
$key = $keyLine.Split('=')[1].Trim()
$url = 'https://azsfuomylwpejwlmnbsc.supabase.co'
$headers = @{ Authorization = 'Bearer ' + $key; apikey = $key }
$tables = @('garages','vehicles','garage_spots','notifications','admin_settings','vehicle_types','key_locations')
foreach($t in $tables){
  try {
    $uri = "$url/rest/v1/$t?select=*`&limit=1"
    $r = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -ErrorAction Stop
    if($r) { Write-Output ($t + ': OK (sample row returned)') } else { Write-Output ($t + ': empty or no rows') }
  } catch {
    Write-Output ($t + ': ERROR - ' + $_.Exception.Message)
  }
}