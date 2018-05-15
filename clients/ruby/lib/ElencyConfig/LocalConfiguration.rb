require 'net/http'

class Configuration

  def initialize()
    @appVersion = nil
    @environment = nil
    @configurationId = nil
    @configurationData = nil
  end

  def appVersion
    @appVersion
  end

  def appVersion=(appVersion)
    @appVersion
  end

  def environment
    @environment
  end

  def environment=(environment)
    @environment
  end

  def configurationId
    @configurationId
  end

  def configurationId=(configurationId)
    @configurationId
  end

  def configurationData
    @configurationData
  end

  def configurationData=(configurationData)
    @configurationData
  end

  def validate
    if (@appVersion == nil)
      raise "appVersion has not been defined on LocalConfiguration"
    end

    if (@environment == nil)
      raise "environment has not been defined on LocalConfiguration"
    end

    if (@configurationId == nil)
      raise "configurationId has not been defined on LocalConfiguration"
    end

    if (@configurationData == nil)
      raise "configurationData has not been defined on LocalConfiguration"
    end

  end

end