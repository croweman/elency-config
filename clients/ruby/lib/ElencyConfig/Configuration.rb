require 'net/http'
require 'VersionNumber'

class Configuration

  def initialize()
    @refreshInterval = nil
    @uri = nil
    @appId = nil
    @environment = nil
    @appVersion = nil
    @HMACAuthorizationKey = nil
    @configEncryptionKey = nil
    @retrieved = nil
    @refreshFailure = nil
    @requestTimeout = nil
    @localConfiguration = nil
    @versionNumber = VersionNumber.new()
  end

  def refreshInterval
    @refreshInterval
  end

  def refreshInterval=(refreshInterval)
    @refreshInterval
  end

  def uri
    @uri
  end

  def uri=(uri)
    @uri
  end

  def appId
    @appId
  end

  def appId=(appId)
    @appId
  end

  def environment
    @environment
  end

  def environment=(environment)
    @environment
  end

  def appVersion
    @appVersion
  end

  def appVersion=(appVersion)
    @appVersion
  end

  def HMACAuthorizationKey
    @HMACAuthorizationKey
  end

  def HMACAuthorizationKey=(HMACAuthorizationKey)
    @HMACAuthorizationKey
  end

  def configEncryptionKey
    @configEncryptionKey
  end

  def configEncryptionKey=(configEncryptionKey)
    @configEncryptionKey
  end

  def retrieved
    @retrieved
  end

  def retrieved=(retrieved)
    @retrieved
  end

  def refreshFailure
    @refreshFailure
  end

  def refreshFailure=(refreshFailure)
    @refreshFailure
  end

  def requestTimeout
    @requestTimeout
  end

  def requestTimeout=(requestTimeout)
    @requestTimeout
  end

  def localConfiguration
    @localConfiguration
  end

  def localConfiguration=(localConfiguration)
    @localConfiguration
  end

  def validate
    if (@uri == nil)
      raise "uri has not been defined"
    end

    if (@appId == nil)
      raise "appId has not been defined"
    end

    if (@environment == nil)
      raise "environment has not been defined"
    end

    if (@appVersion == nil || !@versionNumber.isValid(@appVersion))
      raise "valid appVersion has not been defined"
    end

    if (@HMACAuthorizationKey == nil || !@HMACAuthorizationKey.instance_of?(String))
      raise "HMACAuthorizationKey has not been defined"
    end

    if (@HMACAuthorizationKey.strip.length != 32)
      raise "HMACAuthorizationKey length should be 32"
    end

    if (@HMACAuthorizationKey =~ /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/ == nil)
       raise "HMACAuthorizationKey must be a Base64 encoded string"
    end

    if (@configEncryptionKey == nil || !@configEncryptionKey.instance_of?(String))
      raise "configEncryptionKey has not been defined"
    end

    if (@configEncryptionKey.strip.length != 32)
      raise "configEncryptionKey length should be 32"
    end

    if (@configEncryptionKey =~ /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/ == nil)
       raise "configEncryptionKey must be a Base64 encoded string"
    end

    if (@localConfiguration)
      @localConfiguration.validate()
    end

  end
end