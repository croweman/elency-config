const path = require('path')
const { existsSync } = require('fs')
const elencyConfig = require('elency-config')

const waitForServerToBecomeAvailable = async () => {
  const filePath = path.join(__dirname, 'status', 'server-up.txt')

  return new Promise(resolve => {
    var interval = setInterval(() => {
      if (existsSync(filePath)) {
        resolve()
        clearInterval(interval)
      }
    }, 200)
  })
}

const start = async () => {
  await waitForServerToBecomeAvailable()

  const appId = 'centre'
  const environment = 'Prod'
  const HMACAuthorizationKey = 'YWJlZjYwNzQwYzk4NDY4Zjg3ZTg5MWU0'
  const configEncryptionKey = 'M2Y0M2E0NTMyZDBjNDNjNDk5YWJjOGEy'

  let elencyConfigInstance

  const retrieved = () => {
    console.log()
    console.log('__________________________________________')
    console.log(`Configuration retrieved: ${new Date().toString()}`)
    console.log('Version: ' + elencyConfigInstance.appVersion)
    console.log('Environment: ' + elencyConfigInstance.environment)
    console.log('Configuration Id: ' + elencyConfigInstance.configurationId)
    console.log('Keys and values:')
    console.log()
    
    elencyConfigInstance.getAllKeys().forEach((key) => {
      console.log(key + ': ' + elencyConfigInstance.get(key))
    })

    console.log()
    console.log('Typed configuration:')
    console.log()
    console.log(JSON.stringify(elencyConfigInstance.typedConfiguration, null, 2))

    console.log('__________________________________________')
  }

  const refreshFailure = (err) => {
    console.log(JSON.stringify(err))
    console.log('** REFRESH FAILURE CONFIG **')
  }

  elencyConfigInstance = elencyConfig({
    uri: 'http://app:3000',
    appId,
    appVersion: '2.0.0',
    environment,
    refreshInterval: 1000,
    HMACAuthorizationKey,
    configEncryptionKey,
    retrieved,
    refreshFailure,
    configurationMapping: [
      { configurationPropertyName: 'REST_API_URL', propertyName: 'restApiUrl' },
      { configurationPropertyName: 'ENVIRONMENT', propertyName: 'environment' },
      { configurationPropertyName: 'LOG_LEVEL', propertyName: 'logLevel' },
      { configurationPropertyName: 'SECURE_DATA', propertyName: 'secureData' }
    ]
  })

  try {
    await elencyConfigInstance.init()
  }
  catch (err) {
    console.log('An error occurred while initialising elency-config client')
    console.log(err)
    process.exit(1)
  }
}

start()