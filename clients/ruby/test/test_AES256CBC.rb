require 'minitest/autorun'
require 'ElencyConfig/AES256CBC'

class ElencyConfigAES256CBCTest < Minitest::Test

  def test_AES_256_CBC_corretly_encrypts_a_string
    password = "th15154p455w0rd!th15154p455w0rd!"
    iv = "42d1e9706b63140c"
    encryptor = AES256CBC.new()
    val = encryptor.encrypt("TheValueToEncrypt", password, iv)
    assert_equal(val.length, 2)
    assert_equal(val[0], "5cc4051bc64227f25ca14836005156fc8afa0b3be93115fe2fb6cb3a3a3dd217")
    assert_equal(val[1], "42d1e9706b63140c")
  end

  def test_AES_256_CBC_corretly_decrypts_a_string
    password = "th15154p455w0rd!th15154p455w0rd!"
    iv = "42d1e9706b63140c"
    encryptor = AES256CBC.new()
    val = encryptor.encrypt("TheValueToEncrypt", password, iv)
    val = encryptor.decrypt(val, password)
    assert_equal(val, "TheValueToEncrypt")
  end
end