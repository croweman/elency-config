require 'ElencyConfig/Client'

class ElencyConfig
  def createClient
    client = Client.new()
    return client
  end
end