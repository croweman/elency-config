Gem::Specification.new do |s|
  s.name        = 'ElencyConfig'
  s.version     = '0.0.1'
  s.date        = '2018-05-10'
  s.summary     = "elency-config - ruby client"
  s.description = "elency-config - ruby client"
  s.authors     = ["Lee Crowe"]
  s.email       = 'leecrowe81@googlemail.co.uk'
  s.files       = [ "lib/ElencyConfig.rb",
                    "lib/ElencyConfig/HMACSHA256.rb",
                    "lib/ElencyConfig/Client.rb",
                    "lib/ElencyConfig/AES256CBC.rb",
                    "lib/ElencyConfig/VersionNumber.rb",
                    "lib/ElencyConfig/Configuration.rb",
                    "lib/ElencyConfig/LocalConfiguration.rb",
                  ]
  s.homepage    =
    'git://github.com/croweman/elency-config.git'
  s.license       = 'MIT'
end