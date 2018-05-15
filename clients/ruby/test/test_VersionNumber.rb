require 'minitest/autorun'
require 'ElencyConfig/VersionNumber'

class ElencyConfigVersionNumberTest < Minitest::Test

  def test_VersionNumbers
    versionNumberExpectations = [
      [ "1", false ],
      [ "1.", false ],
      [ "1.1", false ],
      [ "12.12", false ],
      [ "1.1.1", true ],
      [ "12.12.12", true ],
      [ "1.1.1.1", false ],
      [ "12.12.12.12", false ],
      [ "1.1.1.1.", false ],
      [ "12.12.12.12.", false ],
      [ "1.1.1.1.1", false ],
      [ "12.12.12.12.12", false ],
      [ "a", false ],
      [ "a.a", false ],
      [ "a.a.a", false ],
      [ "a.a.a.a", false ],
      [ nil, false ],
      [ "", false ],
      [ "1 1.1", false ]
    ]

    versionNumber = VersionNumber.new()

    for index in 0 ... versionNumberExpectations.size
      versionNumberString = versionNumberExpectations[index][0]
      expectation = versionNumberExpectations[index][1]
      isValid = versionNumber.isValid(versionNumberString)
      assert_equal(isValid, expectation)
    end

  end
end