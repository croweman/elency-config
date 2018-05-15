require 'base64'
require 'openssl'

class HMACSHA256

  def hash(value, password)
    hashedValue = Base64.encode64("#{OpenSSL::HMAC.digest('sha256', Base64.decode64(password), value)}")
    return hashedValue.strip
  end

end