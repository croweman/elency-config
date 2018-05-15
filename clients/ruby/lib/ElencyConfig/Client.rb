require 'net/http'

class Client

  def initialize()
    @initialized = false
    @config = nil
    @configurationPath = nil
    @currentConfiguration = []
    @currentVersionHash = nil
    @currentAppVersion = nil
    @currentEnvironment = nil
    @currentConfigurationId = nil
    @refreshing = false
    @timeout = 30000
  end

  def init(configuration)
    if (configuration == nil)
      raise "You must define a configuration"
    end

    if (@initialised == true)
      raise "The client is already initialised"
    end

    begin
        configuration.validate()
        @config = configuration
        @configurationPath = "/config/#{@config.appId}/#{@config.environment}/#{@config.appVersion}"
    rescue
      raise
    end

    if (@config.localConfiguration != nil)
      getLocalConfiguration()
      return
    end

    getConfiguration()
    @initialized = true

    # NEEDS TO BE ADDRESSED
    #if (_config.RefreshInterval > 0)
    #{
    #    _timerCallback = new TimerCallback(RefreshConfigurationOnInteval);
    #    _timer = new Timer(_timerCallback, null, 0, _config.RefreshInterval);
    #}

    @initialised = true
  end

  def getLocalConfiguration()
   @currentAppVersion = @config.localConfiguration.appVersion;
   @currentEnvironment = @config.localConfiguration.environment;
   @currentConfigurationId = @config.localConfiguration.configurationId;
   @currentConfiguration = @config.localConfiguration.configurationData;
   @initialized = true;

    if (@config.retrieved != nil)
        @config.Retrieved()
    end
  end

  def checkInitialisation()
    if (!@initialized)
      raise "The client has not been successfully initialized"
    end
  end

  def getConfiguration()
    if (@currentVersionHash != nil)
      begin
        @refreshing = true
        refreshConfiguration()
        @refreshing = false
      rescue
        @refreshing = false
        raise
      end
    else
        retrieveConfiguration()
    end
  end

end