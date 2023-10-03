const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW50aG9ueXdoaXRha2VyIiwiYSI6ImNsNmd0anl5MjB0dmYzam9hZTNtOG9tOGwifQ.bN-fVS2NFZrR81NOv3wn_g';

function onFormSubmit() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const dataRange = sheet.getDataRange()
  const values = dataRange.getValues()
  const addressIndex = values[0].findIndex(v => v === 'Address')
  const latitudeIndex = values[0].findIndex(v => v === 'Latitude')
  const longitudeIndex = values[0].findIndex(v => v === 'Longitude')

  if (addressIndex === -1 || latitudeIndex === -1 || longitudeIndex === -1 || latitudeIndex !== longitudeIndex + 1) {
    SpreadsheetApp.getUi().alert('Malformed sheet')
    return;
  }

  for (let r = 0; r < values.length; ++r) {
    const row = values[r]
    const address = row[addressIndex]
    const latitude = row[latitudeIndex]
    const longitude = row[longitudeIndex]

    if ((!latitude || !longitude) && address) {
      const response = UrlFetchApp.fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?limit=1&access_token=${MAPBOX_TOKEN}`)
      const text = response.getContentText()
      const json = JSON.parse(text)

      if (json.type === 'FeatureCollection' && json.features?.length === 1 && json.features[0].center?.length === 2) {
        sheet
          .getRange(r + 1, longitudeIndex + 1, 1, 2)
          .setValues([json.features[0].center])
      }
    }
  }
}

function doGet() {
  const values = SpreadsheetApp.openById('1YQq0wFCRyUR3QTa3FoSHeeD3mv-KMlKsQRqYLTfVMa8')
    .getSheets()[0]
    .getDataRange()
    .getValues()

  const nameIndex = values[0].findIndex(v => v === 'Name')
  const addressIndex = values[0].findIndex(v => v === 'Address')
  const titleIndex = values[0].findIndex(v => v === 'Title')
  const skillsIndex = values[0].findIndex(v => v === 'Skills')
  const linkedInIndex = values[0].findIndex(v => v === 'LinkedIn')
  const imageUrlIndex = values[0].findIndex(v => v === 'Image URL')
  const latitudeIndex = values[0].findIndex(v => v === 'Latitude')
  const longitudeIndex = values[0].findIndex(v => v === 'Longitude')

  const peeps = values.slice(3).map(row => {
    return {
      name: row[nameIndex],
      address: row[addressIndex],
      title: row[titleIndex],
      skills: row[skillsIndex],
      linkedIn: row[linkedInIndex],
      imageUrl: row[imageUrlIndex],
      latitude: row[latitudeIndex],
      longitude: row[longitudeIndex],
    }
  }).filter(peep => Boolean(peep.latitude && peep.longitude))

  return ContentService.createTextOutput(JSON.stringify({peeps}))
    .setMimeType(ContentService.MimeType.JSON); 
}
