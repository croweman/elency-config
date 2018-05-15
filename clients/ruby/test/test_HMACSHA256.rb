require 'minitest/autorun'
require 'ElencyConfig/HMACSHA256'

class ElencyConfigHMACSHA256Test < Minitest::Test
  def test_HMAC_SHA256_corretly_hashes_a_string
    hasher = HMACSHA256.new()
    hashedValue = hasher.hash("TheValueToEncrypt", "aGVsbG93b3JsZA==")
    assert_equal("j8l2ru3YrVfmCsfF51eIDw4RZ9gCh9Mm0KbSm5JfeJ0=", hashedValue)
  end
end