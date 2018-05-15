require 'minitest/autorun'
require 'ElencyConfig/Client'

class ElencyConfigClientTest < Minitest::Test
  def test_init_raises_an_error_if_provide_with_undefined_Configuration
    begin
        client = Client.new()
        client.init(nil)
        assert_equal("shouldnothavegothere", "")
    rescue
    end
  end

  def test_init_raises_an_error_if_already_initialised
    begin
      client = Client.new()
      client.init(client)
      client.init(client)
      assert_equal("shouldnothavegothere", "")
    rescue
    end
  end
end