var elencyConfig = function() {

  var self = this;
  self.validation = [];
  self.failures = [];

  self.validate = function(force) {
    self.validation.forEach(function(item) {
      item.validate(force);
    });
  };

  self.isValid = function() {

    for (var i = 0; i < self.validation.length; i++) {
      if (!self.validation[i].isValid()) {
        return false;
      }
    }

    return true;
  };

  self.getInputElements = function(id) {
    var input = $('#' + id);
    return {
      inputFormGroup: $('#' + id + '-form-group'),
      input: input,
      inputInfo: $('#' + id + '-info'),
      data: $(input).data()
    };
  };

  self.removeClasses = function(inputElements) {
    inputElements.input.removeClass('form-control-success form-control-warning form-control-danger')
    inputElements.inputFormGroup.removeClass('has-success has-warning has-danger');
  };

  self.setError = function(error, inputElements) {
    self.removeClasses(inputElements);
    inputElements.input.addClass('form-control-danger');
    inputElements.inputFormGroup.addClass('has-danger');
    inputElements.inputInfo.text(error);
  };

  self.demonitor = function(id) {

    for (var i = 0; i < self.validation.length; i++) {
      if (self.validation[i].id === id) {
        self.validation.splice(i, 1);
        return;
      }
    }
  };

  self.monitor = function(id, excludeFromFormValidation) {
    var inputSuccess = false;
    var inputDirty = false;
    var inputElements = self.getInputElements(id);
    var inputFormGroup = inputElements.inputFormGroup;
    var input = inputElements.input;
    var inputInfo = inputElements.inputInfo;
    var data = inputElements.data;

    var regex = undefined;
    var minLength = undefined;
    var length = undefined;
    var validationFunc = undefined;
    var errorMessage = undefined;
    var performValidation = false;
    var comparison = undefined;
    var comparisonType = undefined;
    var comparisonErrorMessage = undefined;

    if (data.regex) {
      regex = new RegExp(data.regex);
      performValidation = true;
    }

    if (data.minlength) {
      minLength = parseInt(data.minlength);
      performValidation = true;
    }

    if (data.length) {
      length = parseInt(data.length);
      performValidation = true;
    }

    if (data.func) {
      validationFunc = self[data.func];
      performValidation = true;
    }

    if (data.errormessage) {
      errorMessage = data.errormessage;
    }

    if (data.comparison && data.comparisontype && data.comparisonerrormessage) {
      comparison = data.comparison;
      comparisonType = data.comparisontype;
      comparisonErrorMessage = data.comparisonerrormessage;
      performValidation = true;
    }

    function validateInput(force) {
      if(!inputDirty && !force) {
        return;
      }

      var val = input.val().trim();

      self.removeClasses(inputElements);
      
      var index = self.failures.indexOf(id); 
      
      if (index != -1) {
        self.failures.splice(index, 1);
      }

      if (performValidation === true && ((regex && !regex.test(val) || (minLength && val.length < minLength) || (length && val.length !== length) || (validationFunc && validationFunc(val) !== true)))) {
        self.setError(errorMessage, inputElements);
        self.failures.push(id);
        inputSuccess = false;
        return;
      }

      if (performValidation === true && comparison) {
        var comparisonVal = $('#' + comparison).val().trim();

        if (comparisonType === 'equal-to' && val !== comparisonVal) {
          self.setError(comparisonErrorMessage, inputElements);
          self.failures.push(id);
          inputSuccess = false;
          return;
        }
      }

      inputSuccess = true;
      input.addClass('form-control-success');
      inputFormGroup.addClass('has-success');
      inputInfo.text('');
    }

    input.on('keyup blur', function() {
      inputDirty = true;
      self.validate(false);
    });

    var obj = {
      id: id,
      isValid: function() {
        return inputSuccess === true;
      },
      setError: function(error) {
        self.setError(error, inputElements);
      },
      value: function() {
        return input.val().trim();
      },
      validate: validateInput
    };

    if (excludeFromFormValidation === undefined) {
      self.validation.push(obj);
    }

    return obj;
  }

  self.showError = function(error) {
    var errorBox = $('#error-box');

    if (errorBox.length > 0) {
      $('#error-box-message').text(error);
      errorBox.css('display', 'block');
    }
  };

  self.fireActionOn = function(id, options) {
    options = options || {};

    var state = {
      enabled: true
    };

    $('#' + id).on('click', function() {
      var $this = $(this);

      if (!state.enabled) {
        return false;
      }

      if (options.preValidate) {
        options.preValidate();
      }

      $('#error-box').css('display', 'none');
      state.enabled = false;

      self.failures = [];
      self.validate(true);

      if (!self.isValid()) {
        state.enabled = true;
        //window.location = '#top';

        if (self.failures.length > 0) {
          $('#' + self.failures[0]).focus();
        }

        return false;
      }

      if (options.additionalValidation) {
        var valid = options.additionalValidation();

        if (valid === false) {
          state.enabled = true;
          //window.location = '#top';

          if (self.failures.length > 0) {
            $('#' + self.failures[0]).focus();
          }

          return false;
        }
      }

      if (options.ajax) {
        var ajaxAction = options.ajax;
        
        if (ajaxAction) {
          var payload = ajaxAction.payload();

          $this.button('loading');

          $.ajax({
            type: ajaxAction.type || 'POST',
            url: ajaxAction.url,
            data: payload,
            success: function(data, textStatus) {
              if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
                window.location = '/login';
                return;
              }

              $this.button('reset');
              state.enabled = true;

              if (ajaxAction.success) {
                ajaxAction.success(data, textStatus);
              }
              else {
                if (data.location) {
                  return window.location = data.location;
                }

                if (data.error) {
                  return self.showError(data.error);
                }
              }
            },
            error: function(xhr, err) {
              $this.button('reset');
              state.enabled = true;

              if (ajaxAction.error) {
                ajaxAction.error(xhr, err);
              }
              else {
                self.showError('An unexpected error occurred!')
              }
            },
            dataType: 'json'
          });
        }
      }

      return options.returnResult === true;
    });
    
  };

  self.login = function() {
    self.monitor('username');
    self.monitor('password');
    self.fireActionOn('login', { returnResult: true });
  }

  self.createAdminUser = function() {
    var password = self.monitor('password');
    self.monitor('confirm-password');

    self.fireActionOn('createUser', {
      ajax: {
        url: '/createAdminUser',
        payload: function() {
          return {
            password: password.value()
          }
        }
      }
    });
  };

  self.getSelecedRolePermissions = function() {
    var rolePermissions = [];
    var matches = $('#role-permissions .role-permission');

    for (var i = 0; i < matches.length; i++) {
      var current = $(matches[i]);
      rolePermissions.push(current.data().roleid);
    };

    return rolePermissions;
  };

  self.getSelecedTeamPermissions = function() {
    var teamPermissions = [];
    var matches = $('#team-permissions .team-permission');

    for (var i = 0; i < matches.length; i++) {
      var current = $(matches[i]);
      teamPermissions.push(current.data().teamid);
    };

    return teamPermissions;
  };

  self.getSelectedAppConfigurationPermissions = function() {
    var appConfigurationPermissions = {};
    var matches = $('#app-permissions .app-environment');

    for (var i = 0; i < matches.length; i++) {
      var current = $(matches[i]);
      var select = $(current).find('select');


      if (select.val().length > 0) {
        var data = current.data();
        var appId = data.appid;
        var environment = data.environment;
        var type = select.val();

        if (!appConfigurationPermissions[appId]) {
          appConfigurationPermissions[appId] = {};
        }

        appConfigurationPermissions[appId][environment] = type;
      }
    }

    return appConfigurationPermissions;
  };

  self.settings = function() {
    var useLdap = $('#useLdap');
    var uri;
    var managerDn;
    var managerPassword;
    var searchBase;
    var searchFilter;
    var checkingInProgress = false;

    function toggleLdap() {
      $('#ldap-error').addClass('hide');
      $('#ldap-success').addClass('hide');
      var ldapDisabled = !$(useLdap).is(':checked');

      if (ldapDisabled) {
        $('#uri').attr('disabled', 'disabled');
        $('#manager-dn').attr('disabled', 'disabled');
        $('#manager-password').attr('disabled', 'disabled');
        $('#search-base').attr('disabled', 'disabled');
        $('#search-filter').attr('disabled', 'disabled');
        $('#check-ldap').addClass('hide');
        $('#edit-password-container').addClass('hide');
        self.demonitor('uri');
        self.demonitor('manager-dn');
        self.demonitor('manager-password');
        self.demonitor('search-base');
        self.demonitor('search-filter');

        self.removeClasses(self.getInputElements('uri'));
        self.removeClasses(self.getInputElements('manager-dn'));
        self.removeClasses(self.getInputElements('manager-password'));
        self.removeClasses(self.getInputElements('search-base'));
        self.removeClasses(self.getInputElements('search-filter'));
      }
      else {
        $('#uri').removeAttr('disabled');
        $('#manager-dn').removeAttr('disabled');
        $('#manager-password').removeAttr('disabled');
        $('#search-base').removeAttr('disabled');
        $('#search-filter').removeAttr('disabled');
        $('#check-ldap').removeClass('hide');
        $('#edit-password-container').removeClass('hide');
        uri = self.monitor('uri');
        managerDn = self.monitor('manager-dn');
        managerPassword = self.monitor('manager-password');
        searchBase = self.monitor('search-base');
        searchFilter = self.monitor('search-filter');
      }
    }

    toggleLdap();

    $('#useLdap').on('click', toggleLdap);

    $('#edit-password').on('click', function() {
      ldapManagerEncryptedPassword = false;
      ldapManagerEncryptedPasswordValue = '';
      
      $('#manager-password').val('');
      $('#manager-password').attr('readonly', false);
      $('#edit-password-container').css('display', 'none');
    });

    self.fireActionOn('saveSettings', {
      ajax: {
        url: '/settings',
        payload: function() {

          var ldapEnabled = $(useLdap).is(':checked');
          
          return {
            ldapEnabled: ldapEnabled,
            ldapUri: ldapEnabled ? uri.value() : $('#uri').val(),
            ldapManagerDn: ldapEnabled ? managerDn.value() : $('#manager-dn').val(),
            ldapManagerPassword: ldapEnabled ? managerPassword.value() : $('#manager-password').val(),
            ldapSearchBase: ldapEnabled ? searchBase.value() : $('#search-base').val(),
            ldapSearchFilter: ldapEnabled ? searchFilter.value() : $('#search-filter').val(),
            ldapManagerEncryptedPassword: ldapManagerEncryptedPasswordValue
          };
        }
      }
    });

    $('#check-ldap').on('click', function() {

      $('#ldap-error').addClass('hide');
      $('#ldap-success').addClass('hide');
      
      if (checkingInProgress) {
        return false;
      }

      var $this = $(this);
      $this.button('loading');
      checkingInProgress = true;
      
      var passwordValue = (ldapManagerEncryptedPassword === true ? ldapManagerEncryptedPasswordValue : managerPassword.value());

      $.ajax({
        type: 'POST',
        url: '/validate-ldap',
        data: {
          ldapUri: uri.value(),
          ldapManagerDn: managerDn.value(),
          ldapManagerPassword: passwordValue,
          ldapManagerEncryptedPassword: ldapManagerEncryptedPassword === true
        },
        success: function(data, textStatus) {
          if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
            window.location = '/login';
            return;
          }

          $('#ldap-error').addClass('hide');
          $('#ldap-success').removeClass('hide');
          checkingInProgress = false;
          $this.button('reset');
        },
        error: function(xhr, err) {
          checkingInProgress = false;
          $('#ldap-error').removeClass('hide');
          $('#ldap-success').addClass('hide');
          $this.button('reset');
        }
      });

      return false;
    });
  };

  var rolePermissionIndex = 10000;
  var teamPermissionIndex = 10000;
  var appPermissionIndex = 10000;

  self.addRolePermission = function(roleId, displayText) {
    rolePermissionIndex++;

    var existingPermissions = $('#role-permissions .role-permission');

    for (var i = 0; i < existingPermissions.length; i++) {
      if ($(existingPermissions[i]).data().roleid === roleId) {
        $('#role').typeahead('val', '');
        return;
      }
    }

    var id = 'role-permission-' + rolePermissionIndex;
    var selector = '#' + id;
    var html = '<div id="' + id + '" class="role role-permission col-md-12" data-roleid="' + roleId + '"><button class="close" type="button" title="Remove" onclick="javascript:$(\'' + selector + '\').remove();elencyConfig.rolePermissionSetup();">×</button><div class="col-md-6 role-selection">' + displayText + '</div></div>';
    $('#role-permissions').append(html);
    self.rolePermissionSetup();
    $('#role').typeahead('val', '');
  };

  self.addTeamPermission = function(teamId, displayText) {
    teamPermissionIndex++;

    var existingPermissions = $('#team-permissions .team-permission');

    for (var i = 0; i < existingPermissions.length; i++) {
      if ($(existingPermissions[i]).data().teamid === teamId) {
        $('#team').typeahead('val', '');
        return;
      }
    }

    var id = 'team-permission-' + teamPermissionIndex;
    var selector = '#' + id;
    var html = '<div id="' + id + '" class="team team-permission col-md-12" data-teamid="' + teamId + '"><div class="col-md-6">' + displayText + '</div><div class="col-md-4"><select><option value="w">Write</option></select></div><button class="close" type="button" title="Remove" onclick="javascript:$(\'' + selector + '\').remove();elencyConfig.teamPermissionSetup();">×</button></div>';
    $('#team-permissions').append(html);
    self.teamPermissionSetup();
    $('#team').typeahead('val', '');
  };

  self.addAppPermission = function(appId, displayText) {
    appPermissionIndex++;

    var existingPermissions = $('#app-permissions .app-permission');

    for (var i = 0; i < existingPermissions.length; i++) {
      if ($(existingPermissions[i]).data().appid === appId) {
        $('#app').typeahead('val', '');
        return;
      }
    }

    var id = 'app-permission-' + appPermissionIndex;
    var selector = '#' + id;
    var html = '<div id="' + id + '" class="team app-permission col-md-12" data-appid="' + appId + '"><button class="app-delete close" type="button" title="Remove" onclick="javascript:$(\'' + selector + '\').remove();elencyConfig.appPermissionSetup();">×</button><div class="col-md-11">' + displayText;

    for (var i = 0; i < appEnvironments.length; i++) {
      if (appEnvironments[i].appId === appId) {
        for (var j = 0; j < appEnvironments[i].environments.length; j++) {
          var environment = appEnvironments[i].environments[j];
          html += '<div class="col-md-12 app-permission app-environment" data-appid="' + appId + '" data-environment="' + environment + '"><div class="col-md-1">&nbsp;</div><div class="col-md-5 strong">' + environment + '</div><div class="col-md-4"><select><option value="">None</option><option value="r" selected="true">Read</option><option value="rw">Write</option><option value="rwp">Publish</option></select></div></div>';
        }
        break;
      }
    }

    html += '</div></div>';
    $('#app-permissions').append(html);
    self.appPermissionSetup();
    $('#app').typeahead('val', '');
  };

  self.getIdFromLookupValue = function(value) {
    var id = value.substr(0, value.length - 1);
    return id.substr(id.lastIndexOf('(') + 1);
  };

  self.getIdFromLookupValueRole = function(value) {
    for (var i = 0; i < availableRoles.length; i++) {
      if (availableRoles[i].roleName === value) {
        return availableRoles[i].roleId;
      }
    }
    return undefined;
  };

  self.lookupMatcher = function(item, selector, idAttr) {
    return function findMatches(q, cb) {
      var matches, substringRegex;
      matches = [];
      substrRegex = new RegExp(q, 'i');

      $.each(item, function(i, config) {
        if (substrRegex.test(config)) {
          matches.push(config);
        }
      });

      var selectedItems = $(selector);
      var selections = [];
      for (var i = 0; i < selectedItems.length; i++) {
        selections.push($(selectedItems[i]).data()[idAttr])
      }

      var filteredMatches = [];

      for (var i = 0; i < matches.length; i++) {
        var id = self.getIdFromLookupValue(matches[i]);
        var match = false;

        for (var j = 0; j < selections.length; j++) {
          if (selections[j] === id) {
            match = true;
            break;
          }
        }

        if (!match) {
          filteredMatches.push(matches[i]);
        }
      }

      cb(filteredMatches);
    };
  };

  self.lookupMatcherRole = function(item, selector, idAttr) {
    return function findMatches(q, cb) {
      var matches, substringRegex;
      matches = [];
      substrRegex = new RegExp(q, 'i');

      $.each(item, function(i, config) {
        if (substrRegex.test(config.roleName)) {
          matches.push(config.roleName);
        }
      });

      var selectedItems = $(selector);
      var selections = [];
      for (var i = 0; i < selectedItems.length; i++) {
        selections.push($(selectedItems[i]).data()[idAttr])
      }

      var filteredMatches = [];


      for (var i = 0; i < matches.length; i++) {
        var id = self.getIdFromLookupValueRole(matches[i]);

        if (id === undefined) {
          break;
        }

        var match = false;

        for (var j = 0; j < selections.length; j++) {
          if (selections[j] === id) {
            match = true;
            break;
          }
        }

        if (!match) {
          filteredMatches.push(matches[i]);
        }
      }

      cb(filteredMatches);
    };
  };

  self.userPermissionsSetup = function() {

    self.rolePermissionSetup();
    self.teamPermissionSetup();
    self.appPermissionSetup();
  };

  self.rolePermissionSetup = function() {
    if (typeof availableRoles === 'undefined') {
      return;
    }

    var options = {
      hint: true,
      highlight: true,
      minLength: 0
    };

    $('#role').typeahead('destroy','NoCached');

    $('#role').typeahead(options, {
      name: 'roles',
      source: self.lookupMatcherRole(availableRoles, '#role-permissions .role-permission', 'roleid'),
      limit: 10
    });

    $('#role').bind('typeahead:selected  typeahead:autocompleted', function(obj, datum) {
      self.addRolePermission(self.getIdFromLookupValueRole(datum), datum);
    });
  };

  self.teamPermissionSetup = function() {
    var options = {
      hint: true,
      highlight: true,
      minLength: 0
    };

    $('#team').typeahead('destroy','NoCached');

    $('#team').typeahead(options, {
      name: 'teams',
      source: self.lookupMatcher(availableTeams, '#team-permissions .team-permission', 'teamid'),
      limit: 10
    });

    $('#team').bind('typeahead:selected  typeahead:autocompleted', function(obj, datum) {
      self.addTeamPermission(self.getIdFromLookupValue(datum), datum);
    });
  };

  self.appPermissionSetup = function() {
    var options = {
      hint: true,
      highlight: true,
      minLength: 0
    };

    $('#app').typeahead('destroy','NoCached')

    $('#app').typeahead(options, {
      name: 'apps',
      source: self.lookupMatcher(availableApps, '#app-permissions .app-permission', 'appid'),
      limit: 10
    });

    $('#app').bind('typeahead:selected  typeahead:autocompleted', function(obj, datum) {
      self.addAppPermission(self.getIdFromLookupValue(datum), datum);
    });

  };

  self.createUser = function() {
    var userName = self.monitor('username');
    var password;

    if (ldapEnabled === false) {
      password = self.monitor('password');
      self.monitor('confirm-password');
    }

    self.fireActionOn('createUser', {
      ajax: {
        url: '/user/create',
        payload: function() {

          var teamPermissions = self.getSelecedTeamPermissions();
          var appConfigurationPermissions = self.getSelectedAppConfigurationPermissions();
          var rolePermissions = self.getSelecedRolePermissions();

          var payload = {
            enabled: $('#enabled').is(':checked'),
            roles: rolePermissions,
            teamPermissions: teamPermissions,
            appConfigurationPermissions: appConfigurationPermissions,
            ldapEnabled: ldapEnabled
          };

          if (ldapEnabled === true) {
            payload.userId = $('#userid').val();
            payload.userName = $('#username').val();
          }
          else {
            payload.userName = userName.value();
            payload.password = password.value();
          }

          return payload;
        }
      }
    });
    self.userPermissionsSetup();
  };

  self.updateUser = function() {

    self.fireActionOn('updateUser', {
      ajax: {
        url: '/user/' + $('#userid').val() + '/update',
        payload: function() {

          var teamPermissions = self.getSelecedTeamPermissions();
          var appConfigurationPermissions = self.getSelectedAppConfigurationPermissions();
          var rolePermissions = self.getSelecedRolePermissions();

          return {
            enabled: $('#enabled').is(':checked'),
            roles: rolePermissions,
            teamPermissions: teamPermissions,
            appConfigurationPermissions: appConfigurationPermissions
          };
        }
      }
    });
    self.userPermissionsSetup();
  };
  
  self.changePassword = function() {

    var password = self.monitor('password');
    self.monitor('confirm-password');

    self.fireActionOn('changePassword', {
      ajax: {
        url: window.location.url,
        payload: function () {
          return {
            password: password.value()
          };
        },
        success: function () {
          if ($('#changing-self').val() === 'true') {
            window.location = '/logout';
          }
          else {
            window.location = '/user/all';
          }
        }
      }
    });
  };

  self.createRole = function() {
    var roleName = self.monitor('rolename');

    self.fireActionOn('createRole', {
      ajax: {
        url: '/role/create',
        payload: function() {
          var teamPermissions = self.getSelecedTeamPermissions();
          var appConfigurationPermissions = self.getSelectedAppConfigurationPermissions();

          return {
            roleName: roleName.value(),
            teamPermissions: teamPermissions,
            appConfigurationPermissions: appConfigurationPermissions
          };
        }
      }
    });
    self.userPermissionsSetup();
  };

  self.updateRole = function() {

    var roleName = self.monitor('rolename');
    self.fireActionOn('updateRole', {
      ajax: {
        url: '/role/' + $('#roleid').val() + '/update',
        payload: function() {

          var teamPermissions = self.getSelecedTeamPermissions();
          var appConfigurationPermissions = self.getSelectedAppConfigurationPermissions();

          return {
            roleName: roleName.value(),
            teamPermissions: teamPermissions,
            appConfigurationPermissions: appConfigurationPermissions
          };
        }
      }
    });
    self.userPermissionsSetup();
  };
  
  self.createTeam = function() {
    var teamId = self.monitor('teamid');
    var teamName = self.monitor('teamname');
    var description = self.monitor('description');

    self.fireActionOn('createTeam', {
      ajax: {
        url: '/team/create',
        payload: function() {

          return {
            teamId: teamId.value(),
            teamName: teamName.value(),
            description: description.value()
          };
        }
      }
    });
  };
  
  self.updateTeam = function() {
    var teamName = self.monitor('teamname');
    var description = self.monitor('description');

    self.fireActionOn('updateTeam', {
      ajax: {
        url: '/team/' + $('#teamid').val() + '/update',
        payload: function() {

          return {
            teamName: teamName.value(),
            description: description.value()
          };
        }
      }
    });
  };

  self.generateKey = function() {
    $('#generateKey').on('click', function() {
      var $this = $(this);
      $this.button('loading');
      $.ajax({
        type: 'GET',
        url: '/key/generate',
        success: function(data) {
          if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
            window.location = '/login';
            return;
          }
          $('#keyvalue').val(data.key);
          $this.button('reset');
        },
        error: function() {
          $('#error-box-key-decrypt').css('display', 'block');
          $this.button('reset');
        },
        dataType: 'json'
      });
      return false;
    });
  }

  self.createKey = function() {
    self.generateKey();
    var keyName = self.monitor('keyname');
    var description = self.monitor('description');
    var keyValue = self.monitor('keyvalue');

    self.fireActionOn('createKey', {
      ajax: {
        url: '/key/create',
        payload: function() {
          return {
            keyName: keyName.value(),
            description: description.value(),
            value: keyValue.value()
          };
        }
      }
    });
  };

  self.updateKey = function() {

    var keyValue = undefined;
    var changingKeyValue = false;
    self.generateKey();

    $('#changeKeyValue').on('click', function() {
      changingKeyValue = true;
      keyValue = self.monitor('keyvalue');
      $('#error-box-key-decrypt').css('display', 'none');
      $('#keyvalue').val($('#thekeyvalue').val());
      $('#encryptedkeyvalue').css('display', 'none');
      $('#change-key-value-container').css('display', 'block');
      return false;
    });

    $('#decryptKeyValue').on('click', function() {

      var file = $('#file')[0].files[0];

      if (!file) {
        $('#error-box-key-required').removeClass('hide');
        return false;
      }

      $('#error-box-key-required').addClass('hide');

      var $this = $(this);

      var reader = new FileReader();
      reader.onload = function(e) {
        var payload = {
          privateKey: e.target.result,
          valueToDecrypt: $('#originalkeyvalue').val()
        };

        $this.button('loading');

        $.ajax({
          type: 'POST',
          url: '/key/decrypt',
          data: payload,
          success: function(data) {
            if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
              window.location = '/login';
              return;
            }
            $('#error-box-key-decrypt').css('display', 'none');
            $('#thekeyvalue').val(data.value)
            $('#decryptKeyValue').css('display', 'none');
            $('#file').css('display', 'none');
            $this.button('reset');
          },
          error: function() {
            $('#error-box-key-decrypt').css('display', 'block');
            $this.button('reset');
          },
          dataType: 'json'
        });
      }
      reader.readAsText(file);
      return false
    });

    var keyName = self.monitor('keyname');
    var description = self.monitor('description');

    self.fireActionOn('updateKey', {
      ajax: {
        url: '/key/' + $('#keyid').val() + '/update',
        payload: function() {

          return {
            keyName: keyName.value(),
            description: description.value(),
            changingKeyValue: changingKeyValue,
            value: keyValue !== undefined ? keyValue.value() : ''
          };
        }
      }
    });
  };

  self.createApp = function() {
    var appId = self.monitor('appid');
    var appName = self.monitor('appname');
    var description = self.monitor('description');
    var teamId = $('#teamid').val();

    self.fireActionOn('createApp', {
      ajax: {
        url: '/team/' + teamId + '/app/create',
        payload: function() {

          return {
            appId: appId.value(),
            appName: appName.value(),
            description: description.value()
          };
        }
      }
    });
  };

  self.updateApp = function() {
    var appName = self.monitor('appname');
    var description = self.monitor('description');
    var teamId = self.monitor('teamid');
    var appId = $('#appid').val();

    self.fireActionOn('updateApp', {
      ajax: {
        url: '/team/' + teamId.value() + '/app/' + appId + '/update',
        payload: function() {
          return {
            appName: appName.value(),
            description: description.value(),
            teamId: teamId.value()
          };
        }
      }
    });
  };

  self.createAppEnvironment = function() {
    var environment = self.monitor('environment');
    var keyId = self.monitor('keyId');
    var teamId = $('#teamid').val();
    var appId = $('#appid').val();

    self.fireActionOn('createAppEnvironment', {
      ajax: {
        url: '/team/' + teamId + '/app/' + appId + '/environment/create',
        payload: function() {
          return {
            environment: environment.value(),
            keyId: keyId.value()
          };
        }
      }
    });
  };

  self.updateAppEnvironment = function() {
    var environment = self.monitor('environment');
    var keyId = self.monitor('keyId');
    var teamId = $('#teamid').val();
    var appId = $('#appid').val();
    var originalEnvironment = $('#originalenvironment').val();

    self.fireActionOn('createAppEnvironment', {
      ajax: {
        url: '/team/' + teamId + '/app/' + appId + '/environment/'  + originalEnvironment + '/update',
        payload: function() {
          return {
            environment: environment.value(),
            keyId: keyId.value()
          };
        }
      }
    });
  };

  self.deleteItem = function(id) {
    self.demonitor(id + 'keyname');
    $('#' + id).remove();
    modifyCount(-1);
  };

  self.swapArrayElements = function(arr, indexA, indexB) {
    var temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
  };

  self.moveUp = function(el, id) {
    var element = $(el);
    var items = element.parents('.configuration-item');
    var swapWith = items.prev();
    items.after(swapWith.detach());

    for (var i = 0; i < self.validation.length; i++) {
      if (self.validation[i].id === id) {
        if (i === 0) {
          return;
        }
        self.swapArrayElements(self.validation, i, i - 1);
        return;
      }
    }

    return false;
  };

  self.moveDown = function(el, id) {
    var element = $(el);
    var items = element.parents('.configuration-item');
    var swapWith = items.next();
    items.before(swapWith.detach());

    for (var i = 0; i < self.validation.length; i++) {
      if (self.validation[i].id === id) {
        if (i === self.validation.length - 1) {
          return;
        }
        self.swapArrayElements(self.validation, i, i + 1);
        return;
      }
    }

    return false;
  };

  function modifyCount(inc) {
    currentCount += inc;

    if (currentCount > 1) {
      $('#additional-buttons').removeClass('hide');
    }
    else {
      $('#additional-buttons').addClass('hide');
    }
  }

  self.createConfiguration = function() {
    var version = self.monitor('version');
    var comment = self.monitor('comment');
    var teamId = $('#teamid').val();
    var appId = $('#appid').val();
    var environment = $('#environment').val();
    var enabled = true;
    var keyValue;
    var decrypted = false;


    $('#decryptModal').on('show.bs.modal', function() {
      keyValue = self.monitor('keyvalue', true);
    });

    if (preload === true) {
      for (var i = 0; i < initialEntries; i++) {
        self.monitor('item' + i + 'keyname');
      }
    }

    var url;

    if (updating) {
      url = '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/configuration/' + createFrom + '/update';
    }
    else {
      url = '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/configuration/create';

      if (createFrom && createFrom.length > 0) {
        url += '?createFrom=' + createFrom;
      }
    }

    self.fireActionOn('createConfiguration', {

      ajax: {
        url: url,
        payload: function() {
          var configurationEntries = [];

          var entries = $('#configuration-items .configuration-item');

          for (var i = 0; i < entries.length; i++) {
            var keyValueData = $(entries[i]).find('.key-value').data();
            var alreadyEncrypted = (keyValueData.encrypted === 'true' || keyValueData.encrypted === true);
            var originalKey = (keyValueData.originalkey !== undefined && keyValueData.originalkey.length > 0 ? keyValueData.originalkey : '');

            if (decrypted === true) {
              alreadyEncrypted = false;
              originalKey = '';
            }

            configurationEntries.push({
              key: $(entries[i]).find('.key-name').val().trim(),
              value: $(entries[i]).find('.key-value').val().trim(),
              encrypted: $(entries[i]).find('.key-secure').is(':checked'),
              alreadyEncrypted: alreadyEncrypted,
              originalKey: originalKey
            });
          }

          return {
            version: version.value(),
            comment: comment.value(),
            configurationEntries: configurationEntries
          };
        }
      },
      additionalValidation: function() {
        var keyNames = [];
        var keyNameElements = $('#configuration-items input.key-name');

        for (var i = 0; i < keyNameElements.length; i++) {
          var element = keyNameElements[i];
          var keyName = $(element).val().trim();
          if (keyNames.indexOf(keyName) != -1) {
            var id = $(element).attr('id');
            self.failures.push(id);
            self.showError('All key names must be unique!');
            var inputElements = self.getInputElements(id);
            self.setError('All key names must be unique!', inputElements);
            return false;
          }

          keyNames.push(keyName);
        }

        return true;
      }
    });
    
    function addItem(item) {
      item = item || {};
      itemCount++;
      var itemName = 'item' + itemCount;

      var keyName = item.keyName || '';
      var value = item.value || '';
      var encrypted = item.encrypted === true || item.encrypted === 'true' ? 'checked="checked"' : '';
      keyName = keyName.trim();

      //[ { "keyName":"first", "value": "cheese", "secure": true },{ "keyName":"second", "value": "second\npeas", "secure": false }]
      var html = '<div id="' + itemName + '" class="panel panel-default configuration-item col-md-12"><div class="panel-body"><div class="form-group col-md-6" id="' + itemName + 'keyname-form-group"><label class="form-control-label" for="' + itemName + 'keyname">Key name</label><input class="form-control key-name" id="' + itemName + 'keyname" type="text" value="' + keyName + '" autocomplete="off" data-minlength="1" data-errormessage="Key name must be at least 1 character and contain characters (a-zA-Z0-9_)" data-regex="^[a-zA-Z0-9\_]+$"><div class="form-control-feedback" id="' + itemName + 'keyname-info"></div></div> <button class="close" type="button" title="Delete" onclick="javascript:elencyConfig.deleteItem(\'' + itemName + '\')" tabindex="-1">×</button><button class="close move-up" type="button" title="Move up" onclick="javascript:elencyConfig.moveUp(this, \'' + itemName + 'keyname\')" tabindex="-1"><i class="icon-arrow-up"></i></button><button class="close move-down" type="button" title="Move down" onclick="javascript:elencyConfig.moveDown(this, \'' + itemName + 'keyname\')" tabindex="-1"><i class="icon-arrow-down"></i></button>  <div class="form-group col-md-6 float-right" id="' + itemName + 'value-form-group"><label class="form-control-label" for="' + itemName + 'value">Value</label><div><textarea id="' + itemName + 'value" cols="2" rows="3" class="key-value">' + value +'</textarea></div></div><div id="' + itemName + 'secure-form-group" class="form-group col-md-6 secure-form-group"><div class="form-check"><label class="form-check-label"><input class="form-check-input key-secure" id="' + itemName + 'secure" type="checkbox"' + encrypted + '> Encrypted</label></div></div></div></div>';
      $('#configuration-items').append(html);
      self.monitor(itemName + 'keyname');
      //window.location = '#' + itemName;
      $('#' + itemName + 'keyname').focus();
      modifyCount(1);
      return false;
    }

    $('#addConfigurationItem').on('click', function() {
      return addItem();
    });

    $('#addConfigurationItem2').on('click', function() {
      return addItem();
    });

    $('#goTop').on('click', function() {
      window.location = '#top';
      return false;
    });

    $('#importdata-button').on('click', function() {
      var $this = $(this);
      $('#importdata').removeClass('form-control-success form-control-warning form-control-danger');
      $('#importdata-form-group').removeClass('has-success has-warning has-danger');
      $('#importdata-info').text('');
      var value = $('#importdata').val().trim();

      if (value.length === 0) {
        $('#importdata').addClass('form-control-danger');
        $('#importdata-form-group').addClass('has-danger');
        $('#importdata-info').text('You must enter a JSON payload!');
        return false;
      }

      $this.button('loading');

      try {
        var data = JSON.parse(value);
        if (!Array.isArray(data)) {
          throw 'Not array';
        }

        data.forEach(function(item) {
          if (item.keyName === undefined || item.value === undefined || item.encrypted === undefined) {
            throw 'invalid item';
          }
          addItem(item);
        });

        $('#importdata').val('');
        $this.button('reset');
      }
      catch(err) {
        $('#importdata').addClass('form-control-danger');
        $('#importdata-form-group').addClass('has-danger');
        $('#importdata-info').text('JSON payload is not valid, it must be an array!');
        $this.button('reset');
        return false;
      }

      return true;
    });

    $('#decryptconfigurationentriesbutton').on('click', function() {

      $('#error-box-key-decrypt').css('display', 'none');

      keyValue.validate(true);

      if (!keyValue.isValid()) {
        return false;
      }

      if (!enabled) {
        return false;
      }

      var $this = $(this);
      $this.button('loading');
      enabled = false;

      $.ajax({
        type: 'POST',
        url: '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/version/' + version + '/configuration/' + createFrom + '/decrypt?json=true',
        data: {
          keyValue: keyValue.value()
        },
        success: function(data, textStatus) {
          if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
            window.location = '/login';
            return;
          }

          var encryptedEntries = $('.encrypted-value');

          for (var i = 0; i < data.length; i++) {
            var entry = data[i];

            if (!entry.encrypted) {
              continue;
            }

            for (var j = 0; j < encryptedEntries.length; j++) {
              var encryptedEntry = $(encryptedEntries[j]);
              var textArea = encryptedEntry.parent().parent().find('textarea');
              var textAreaData = textArea.data();
              if (textAreaData && textAreaData.originalkey && textAreaData.originalkey === entry.key) {
                textArea.removeClass('hide');
                textArea.removeAttr('data-encrypted data-originalkey');
                encryptedEntry.parent().find('div').remove();
                $(textArea).val(entry.value);
              }
            }
          }

          decrypted = true;
          enabled = true;
          $('#decrypt').css('display', 'none');
          $('#error-box-key-decrypt').css('display', 'none');
          $('#decryptModal').modal('toggle');
          $this.button('reset');
        },
        error: function(xhr, err) {
          enabled = true;
          $('#error-box-key-decrypt').css('display', 'block');
          $this.button('reset');
        },
        dataType: 'json'
      });

      return false;
    });
  };

  self.configuration = function() {
    var decrypted = false;
    var enabled = true;
    var publishEnabled = true;
    var deleteEnabled = true;
    var keyValue = self.monitor('keyvalue');

    var teamId = $('#teamid').val();
    var appId = $('#appid').val();
    var environment = $('#environment').val();
    var version = $('#version').val();
    var configurationId = $('#configurationId').val();

    $('#decryptconfigurationentriesbutton').on('click', function() {

      $('#error-box-key-decrypt').css('display', 'none');

      keyValue.validate(true);

      if (!keyValue.isValid()) {
        return false;
      }

      if (!enabled) {
        return false;
      }

      var $this = $(this);
      $this.button('loading');
      enabled = false;

      $.ajax({
        type: 'POST',
        url: '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/version/' + version + '/configuration/' + configurationId + '/decrypt',
        data: {
          keyValue: keyValue.value()
        },
        success: function(data, textStatus) {
          if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
            window.location = '/login';
            return;
          }
          $('#configuration-entries').empty();
          $('#configuration-entries').append(data);
          enabled = true;
          decrypted = true;
          $('#decrypt').css('display', 'none');
          $('#error-box-key-decrypt').css('display', 'none');
          $('#decryptModal').modal('toggle');
          $this.button('reset');
        },
        error: function(xhr, err) {
          enabled = true;
          $('#error-box-key-decrypt').css('display', 'block');
          $this.button('reset');
        }
      });

      return false;
    });

    function exportConfigurationEntries() {

      var elements = $('#configuration-entries tbody tr');
      var data = [];

      for (var i = 0; i < elements.length; i++) {
        var cells = $(elements[i]).find('td');
        var item = {};
        item.keyName = $(cells[0]).html().trim();
        item.encrypted = $(cells[1]).html().trim().toLowerCase() === 'yes';
        item.value = $($(cells[2]).find('pre')[0]).html();
        data.push(item);
      }

      $('#encrypted-entries').html(JSON.stringify(data, null, 2));
    }

    $('#exportconfigurationentriesbutton').on('click', function() {

      var $this = $(this);
      $this.button('loading');
      exportConfigurationEntries();
      $('#encrypted-entries-secure-container').css('display', 'none');
      $('#exportconfigurationentriesbutton').css('display', 'none');
      $('#exportconfigurationentriesclosebutton').text('Close');
      $this.button('reset');
      $('#encrypted-entries').focus();
      selectElementContents(document.getElementById('encrypted-entries'));
      return false;
    });

    $('#publishconfigurationentriesbutton').on('click', function() {

      $('#error-box-publish').css('display', 'none');

      if (!publishEnabled) {
        return false;
      }

      var $this = $(this);
      $this.button('loading');
      publishEnabled = false;

      $.ajax({
        type: 'POST',
        url: '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/version/' + version + '/configuration/' + configurationId + '/publish',
        success: function(data, textStatus) {
          if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
            window.location = '/login';
            return;
          }
          publishEnabled = true;
          decrypted = true;
          $this.button('reset');
          window.location = data.location;
        },
        error: function(xhr, err) {
          publishEnabled = true;
          $('#error-box-publish').css('display', 'none');
          $this.button('reset');
        },
        dataType: 'json'
      });

      return false;
    });

    $('#deleteconfigurationentriesbutton').on('click', function() {

      $('#error-box-delete').css('display', 'none');

      if (!deleteEnabled) {
        return false;
      }

      var $this = $(this);
      $this.button('loading');
      deleteEnabled = false;

      $.ajax({
        type: 'POST',
        url: '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/version/' + version + '/configuration/' + configurationId + '/delete',
        success: function(data, textStatus) {
          if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
            window.location = '/login';
            return;
          }
          deleteEnabled = true;
          $this.button('reset');
          window.location = data.location;
        },
        error: function(xhr, err) {
          deleteEnabled = true;
          $('#error-box-delete').css('display', 'none');
          $this.button('reset');
        },
        dataType: 'json'
      });

      return false;
    });

    var lastState = decrypted;

    $('#exportModal').on('show.bs.modal', function() {
      $('#encrypted-entries').html('');

      if (hasSecureItem === true && !decrypted) {
        $('#encrypted-entries-secure-container').css('display', 'block');
        $('#exportconfigurationentriesbutton').css('display', 'block');
        $('#exportconfigurationentriesclosebutton').text('No');
      }
      else {
        exportConfigurationEntries();
        $('#encrypted-entries-secure-container').css('display', 'none');
        $('#exportconfigurationentriesbutton').css('display', 'none');
        $('#exportconfigurationentriesclosebutton').text('Close');
      }
      
      lastState = decrypted;
    });

    $('#exportModal').on('shown.bs.modal', function() {
      $('#encrypted-entries').focus();
      selectElementContents(document.getElementById('encrypted-entries'));
    });

    $('#copy').on('click', function() {
      window.location = $('#copy').data().url;
      return false;
    });

    $('#edit').on('click', function() {
      window.location = $('#edit').data().url;
      return false;
    });
  };

  self.configurationRetrieval = function() {
    var version = self.monitor('version');
    var teamId = $('#teamid').val();
    var appId = $('#appid').val();
    var environment = $('#environment').val();

    self.fireActionOn('search', {
      preValidate: function() {
        if (!$('#revisions').hasClass('hide')) {
          $('#revisions').addClass('hide');
        }

        if (!$('#retrieval-info-box').hasClass('hide')) {
          $('#retrieval-info-box').addClass('hide');
        }

        $('#revisions').find('tbody').html('');
      },
      ajax: {
        url: '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/configuration/retrieval',
        payload: function() {
          return {
            applicationVersion: version.value()
          };
        },
        success: function(data) {
          if (data !== undefined && data.configurationId) {
            var html = '<tr><td>' + data.version + '</td><td><a href="' + data.url + '">' + data.configurationId + '</a></td><td><a href="' + data.updatedBy.url + '">' + data.updatedBy.userName + '</a></td><td><a href="' + data.publishedBy.url + '">' + data.publishedBy.userName + '</a></td><td>' + data.updated + '</td><td>' + data.comment + '</td></tr>';
            $('#revisions').find('tbody').html(html);
            $('#revisions').removeClass('hide');
          }
          else {
            $('#retrieval-info-box').removeClass('hide');
          }
          // show either no matches found or results?
        },
        error: function() {
          self.showError('An unexpected error occurred!')
        }
      }
    });
  };

  self.users = function() {

    var username = self.monitor('username');
    var searchInProgress = false;
    var resultsShown = false;
    
    $('#create-button').on('click', function() {
      if (ldapEnabled !== true) {
        window.location = '/user/create';
        return false;
      }

      return true;
    });

    $('#ldapModal').on('show.bs.modal', function() {
      $('username').val('');
      username = self.monitor('username');
      $('#error-box-ldap-users').css('display', 'none');
      $('#error-box-ldap-select').css('display', 'none');
      $('#results').css('display', 'none');
      resultsShown = false;
    });

    $('#search-users').on('click', function() {

      $('#error-box-ldap-users').css('display', 'none');
      $('#error-box-ldap-select').css('display', 'none');

      if (searchInProgress) {
        return false;
      }

      self.validate(true);

      if (!self.isValid()) {
        return false;
      }

      var $this = $(this);
      $this.button('loading');
      searchInProgress = true;

      $.ajax({
        type: 'POST',
        url: '/ldap-search',
        data: {
          userName: username.value()
        },
        success: function(data, textStatus) {
          if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
            window.location = '/login';
            return;
          }
          var html ='<table class="table"><thead><tr><th>Select</th><th>User Name</th><th>Full Name</th><th>Email Address</th></tr></thead><tbody>';

          for (var i = 0; i < data.length; i++) {
            var entry = data[i];
            html += '<tr><td><input type="radio" name="userradio" id="' + entry.objectGUID + '" data-guid="' + entry.encryptedObjectGUID + '" data-username="' + entry.encryptedUserName + '"></td><td>' + entry.userName + '</td><td>' + entry.name + '</td><td>' + entry.email + '</td></tr>';
          }

          html += '</tbody></table>';

          $('#results').html(html);

          $('#error-box-ldap-users').css('display', 'none');
          $('#error-box-ldap-select').css('display', 'none');
          $('#results').css('display', 'block');
          resultsShown = true;
          searchInProgress = false;
          $this.button('reset');
        },
        error: function(xhr, err) {
          searchInProgress = false;
          $('#error-box-ldap-users').css('display', 'block');
          $('#error-box-ldap-select').css('display', 'none');
          $('#results').css('display', 'none');
          resultsShown = false;
          $this.button('reset');
        },
        dataType: 'json'
      });

      return false;
    });

    $('#adduserbutton').on('click', function() {

      $('#error-box-ldap-select').css('display', 'none');

      if (!resultsShown) {
        return false;
      }

      var value = $("input:radio[name='userradio']:checked");

      if (value.length === 0) {
        $('#error-box-ldap-select').css('display', 'block');
        return false;
      }

      var data = value.data();
      window.location = '/user/create?username=' + data.username + '&userid=' + data.guid;
      return false;
    });
  };
  
  self.revisions = function() {
    var configurationId = elencyConfig.getParameterByName('configurationId');

    if (configurationId !== null) {
      var element = document.getElementById(configurationId);
      element.scrollIntoView();
    }

    var teamId = $('#teamid').val();
    var appId = $('#appid').val();
    var environment = $('#environment').val();
    var version = $('#version').val();

    $('#compare').on('click', function() {

      $('#compare-error').addClass('hide');
      var matches = $('.compare-check:checked');

      if(matches.length < 2) {
        $('#compare-error').removeClass('hide');
        return false;
      }

      var configurationIdOne = $(matches[0]).val();
      var configurationIdTwo = $(matches[1]).val();

      window.location = '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/configuration/compare?configurationIdOne=' + configurationIdOne + '&configurationIdTwo=' + configurationIdTwo;
      return false;
    });
  };
  
  self.compare = function() {

    var configurationOne = self.monitor('configuration-one');
    var configurationTwo = self.monitor('configuration-two');
    var teamId = $('#teamid').val();
    var appId = $('#appid').val();
    var environment = $('#environment').val();
    var compareUrl = '/team/' + teamId + '/app/' + appId + '/environment/' + environment + '/configuration/compare';
    var retrievalInProgress = false;

    var matcher = function(configuration) {
      return function findMatches(q, cb) {
        var matches, substringRegex;
        matches = [];
        substrRegex = new RegExp(q, 'i');

        $.each(configuration, function(i, config) {
          if (substrRegex.test(config)) {
            var match = config.replace(':', ' - ');
            match = match.replace(':true', '');
            match = match.replace(':false', '');
            matches.push(match);
          }
        });

        cb(matches);
      };
    };

    var options = {
      hint: true,
      highlight: true,
      minLength: 0
    };

    var dataSource = {
      name: 'configurations',
      source: matcher(configurations),
      limit: 10
    };

    var keyValue;

    $('#decryptModal').on('show.bs.modal', function() {
      $('#keyvalue').val('');
      keyValue = self.monitor('keyvalue');
    });

    $('#configuration-one-form-group #configuration-one').typeahead(options, dataSource);
    $('#configuration-two-form-group #configuration-two').typeahead(options, dataSource);

    function getConfigurationDetails(value) {

      var val = value.replace(' - ', ':');

      for (var i = 0; i < configurations.length; i++) {
        var configuration = configurations[i];
        var splitted = configuration.split(':');
        configuration = configuration.replace(':true', '');
        configuration = configuration.replace(':false', '');

        if (configuration === val) {
          return {
            configurationId: splitted[1],
            secure: splitted[2] === 'true'
          };
        }
      }

      return {};
    }

    function getComparison($this, body, options) {
      options = options || {};
      var errorBoxId = options.errorBoxId || '#error-box';
      $(errorBoxId).css('display', 'none');

      $.ajax({
        type: 'POST',
        url: compareUrl,
        data: body,
        success: function(data, textStatus) {
          if (data !== undefined && typeof data === 'string' && data.indexOf('elencyConfig.login();') !== -1) {
            window.location = '/login';
            return;
          }
          $('#differences').html(data);
          retrievalInProgress = false;
          if ($this) {
            $this.button('reset');
          }
          if (options.callback) {
            options.callback(true);
          }
        },
        error: function(xhr, err) {
          retrievalInProgress = false;
          $('#differences').html('');
          $(errorBoxId).css('display', 'block');

          if ($this) {
            $this.button('reset');
          }
          if (options.callback) {
            options.callback(false);
          }
        }
      });
    }

    var decryptInProgress = false;

    $('#decryptconfigurationentriesbutton').on('click', function() {

      $('#error-box-key-decrypt').css('display', 'none');

      keyValue.validate(true);

      if (!keyValue.isValid()) {
        return false;
      }

      if (decryptInProgress === true) {
        return false;
      }

      decryptInProgress = true;

      var $this = $(this);
      $this.button('loading');

      var configurationIdOneDetails = getConfigurationDetails(configurationOne.value());
      var configurationIdTwoDetails = getConfigurationDetails(configurationTwo.value());

      function callback(result) {
        decryptInProgress = false;
        self.demonitor('keyvalue');

        if (result === true) {
          $('#decryptModal').modal('hide');
        }
      }

      getComparison($this, {
        configurationIdOne: configurationIdOneDetails.configurationId,
        configurationIdTwo: configurationIdTwoDetails.configurationId,
        keyValue: keyValue.value()
      }, { errorBoxId: '#error-box-key-decrypt', callback: callback });


      return false;
    });

    $('#decryptclosebutton').on('click', function() {
      self.removeClasses(self.getInputElements('keyvalue'));
      self.demonitor('keyvalue');
      $('#keyvalue-info').css('display', 'none');
      return true;
    });

    $('#encryptedentriesbutton').on('click', function() {
      retrievalInProgress = false;
      $('#encrytpedEntriesModal').modal('hide');

      $('#decryptModal').modal('show');
      return false;
    });

    $('#encryptedentriesclosebutton').on('click', function() {
      var configurationIdOneDetails = getConfigurationDetails(configurationOne.value());
      var configurationIdTwoDetails = getConfigurationDetails(configurationTwo.value());

      getComparison(undefined, {
        configurationIdOne: configurationIdOneDetails.configurationId,
        configurationIdTwo: configurationIdTwoDetails.configurationId
      });
      return true;
    });

    $('#compare').on('click', function() {

      $('#error-box').css('display', 'none');

      if (retrievalInProgress === true) {
        return false;
      }

      var $this = $(this);
      $this.button('loading');

      retrievalInProgress = true;

      self.validate(true);

      if (!self.isValid()) {
        retrievalInProgress = false;
        $this.button('reset');
        return false;
      }

      var configurationIdOneDetails = getConfigurationDetails(configurationOne.value());
      var configurationIdTwoDetails = getConfigurationDetails(configurationTwo.value());

      if (configurationIdOneDetails.secure === true || configurationIdTwoDetails.secure === true) {
        $this.button('reset');
        $('#encrytpedEntriesModal').modal('show');
      }
      else {
        getComparison($this, {
          configurationIdOne: configurationIdOneDetails.configurationId,
          configurationIdTwo: configurationIdTwoDetails.configurationId
        });
      }

      return false;
    });
  };

  self.validateCompareConfigurationId = function(value) {
    var val = value.replace(' - ', ':');

    for (var i = 0; i < configurations.length; i++) {
      var configuration = configurations[i];
      configuration = configuration.replace(':true', '');
      configuration = configuration.replace(':false', '');

      if (configuration === val) {
        return true;
      }
    }
    return false;
  };

  self.favourite = function(type, dataIds, dataName) {

    $('#star').on('click', function() {
      $(this).removeClass('selected');
      var isActive = $(this).hasClass('active');

      if (!isActive) {
        $(this).addClass('selected');
      }

      var ids = [];
      var data = $(this).data();
      for (var i = 0; i < dataIds.length; i++) {
        ids.push(data[dataIds[i]]);
      }
      var name = data[dataName];

      $.post({
        type: 'POST',
        url: '/user/favourite',
        data: {
          ids: ids,
          name: name,
          type: type,
          action: isActive ? 'remove' : 'add'
        },
        success: function() {
          if (isActive === true) {
            $('#star').removeClass('active');
          }
          else {
            $('#star').addClass('active');
          }
        },
        error: function() {},
        dataType: 'json'
      });
      return false;
    });
  };

  self.teamFavourite = function() {
    self.favourite('team', ['teamid'], 'teamname');
  };

  self.appFavourite = function() {
    self.favourite('app', ['appid', 'teamid'], 'appname');
  };

  self.getParameterByName = function(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  self.back = function() {
    if (window && window.history && window.history.back) {
      window.history.back();
      return false;
    }
  };

  self.search = function(tableId, cellIndexes) {

    var rows = $('#' + tableId).find('tbody>tr');

    if (rows.length < 6) {
      return;
    }
    
    $('#search-form-group').css('display', 'block');

    var input = $('#search');
    
    input.on('keyup', function() {
      var searchExpression = input.val().trim().toLowerCase();

      for (var i = 0; i < rows.length; i++) {
        var match = false;
        var row = $(rows[i]);

        var cells = row.find('td');

        for (var j = 0; j < cellIndexes.length; j++) {
          var cellIndex = cellIndexes[j];
          var text = $(cells[cellIndex]).text().toLowerCase();

          if (text.indexOf(searchExpression) !== -1) {
            row.removeClass('hide');
            match = true;
            break;
          }
        }

        if (!match) {
          row.addClass('hide');
        }
      }
    });
  };

  self.pagination = function(paginationContainerIds, htmlContainerId, count, pageSize, numberOfPagesInNavigation, url) {
    var pageNumber = 1;
    var retrievalInProgress = false;

    if (!Array.isArray(paginationContainerIds)) {
      paginationContainerIds = [ paginationContainerIds ];
    }

    function getTotalPages() {
      var totalPages = Math.floor(count / pageSize);
      if (count % pageSize != 0) {
        totalPages++;
      }

      if (count <= pageSize) {
        totalPages = 1;
      }

      return totalPages;
    }

    function drawPagination() {
      var html = '<nav aria-label="..."><ul class="pagination justify-content-end">';

      if (pageNumber > 1) {
        html += '<li class="page-item"><a class="page-link first" href="#">&laquo;</a></li>';
        html += '<li class="page-item"><a class="page-link previous" href="#">&lsaquo;</a></li>';
      }
      else {
        html += '<li class="page-item disabled"><span class="page-link">&laquo;</span></li>';
        html += '<li class="page-item disabled"><span class="page-link">&lsaquo;</span></li>';
      }

      var totalPages = getTotalPages();

      if (!(numberOfPagesInNavigation % 2 == 0)) {
        numberOfPagesInNavigation++;
      }

      var lowestPageNumber = (pageNumber - (numberOfPagesInNavigation / 2));
      var difference = 0;

      if (lowestPageNumber < 1) {
        difference = Math.abs(lowestPageNumber);
        lowestPageNumber = 1;
      }

      var highestPageNumber = (pageNumber + (numberOfPagesInNavigation / 2)) + difference;
      var currentPageNumber = lowestPageNumber;

      if ((highestPageNumber - currentPageNumber) < numberOfPagesInNavigation) {
        highestPageNumber = currentPageNumber + numberOfPagesInNavigation;
      }

      if (highestPageNumber > totalPages) {
        highestPageNumber = totalPages;
      }

      if ((highestPageNumber - currentPageNumber) < numberOfPagesInNavigation) {
        currentPageNumber = (highestPageNumber - numberOfPagesInNavigation);
      }

      if (currentPageNumber < 1) {
        currentPageNumber = 1;
      }

      while (currentPageNumber <= highestPageNumber) {
        if (currentPageNumber === pageNumber) {
          html += '<li class="page-item active"><span class="page-link active">' + currentPageNumber + '</span></li>';
        }
        else {
          html += '<li class="page-item"><a class="page-link" href="#">' + currentPageNumber + '</a></li>';
        }
        currentPageNumber++;
      }

      if (pageNumber < totalPages) {
        html += '<li class="page-item"><a class="page-link next" href="#">&rsaquo;</a></li>';
        html += '<li class="page-item"><a class="page-link last" href="#">&raquo;</a></li>';
      }
      else {
        html += '<li class="page-item disabled"><span class="page-link">&rsaquo;</span></li>';
        html += '<li class="page-item disabled"><span class="page-link">&raquo;</span></li>';
      }

      html += '</ul></nav';

      $('#' + paginationContainerIds[0]).html(html);

      if (paginationContainerIds.length > 1) {
        $('#' + paginationContainerIds[1]).html(html);
      }

      setupEventHandlers();
    }

    function setupEventHandlers() {
      $('.pagination .page-link').unbind().click(function () {
        $this = $(this);

        if (retrievalInProgress || $this.hasClass('disabled') || $this.hasClass('active')) {
          return false;
        }

        if ($this.hasClass('first')) {
          pageNumber = 1;
        }
        else if ($this.hasClass('last')) {
          pageNumber = getTotalPages();
        }
        else if ($this.hasClass('previous')) {
          pageNumber--;
        }
        else if ($this.hasClass('next')) {
          pageNumber++;
        }
        else {
          pageNumber = parseInt($this.text());
        }

        retrievalInProgress = true;
        $this.html('<i class="icon-spinner icon-spin"></i>');

        var requestUrl = url;
        var seperator = (requestUrl.indexOf('audit-data?') === -1 ? '?' : '&');
        requestUrl += seperator + 'pageNumber=' + pageNumber;

        $.get({
          type: 'GET',
          url: requestUrl,
          success: function(data) {
            $('#' + htmlContainerId).html(data.html);
            drawPagination();
            setupEventHandlers();
            retrievalInProgress = false;
          },
          error: function() {
            drawPagination();
            setupEventHandlers();
            retrievalInProgress = false;
          },
          dataType: 'json'
        });

        return false;
      });
    }

    drawPagination();
    setupEventHandlers();
  }

  self.audit = function() {
    var paginationContainerIds = [ 'pagination-container-1', 'pagination-container-2' ];
    var htmlContainerId = 'paginated-content';
    var retrievalInProgress = false;
    
    $('#getlogs').on('click', function() {
      if (retrievalInProgress) {
        return false;
      }

      retrievalInProgress = true;
      var $this = $(this);
      $this.button('loading');
      var forceCount = false;
      var selectedAction = $('#action').val();
      var selectedUserId = $('#user').val();
      var url = getLogsUrl;

      var seperator = '?';
      if (selectedAction !== '') {
        url += seperator + 'action=' + selectedAction;
        seperator = '&';
      }
      if (selectedUserId !== '') {
        url += seperator + 'userId=' + selectedUserId;
        seperator = '&';
      }

      var requestUrl = url + seperator + 'forceCount=true';

      $.get({
        type: 'GET',
        url: requestUrl,
        success: function(data) {

          $('#' + htmlContainerId).html(data.html);
          $('#audit').removeClass('audit-hidden');
          elencyConfig.pagination(paginationContainerIds, htmlContainerId, data.count, pageSize, numberOfPagesInNavigation, url)
          $this.button('reset');
          retrievalInProgress = false;
        },
        error: function() {
          $this.button('reset');
          retrievalInProgress = false;
        },
        dataType: 'json'
      });

      return false;
    });
  };

  function setupCancel() {
    var cancel = $('#cancel');

    if (cancel.length > 0) {
      $('#cancel').on('click', self.back);
    }
  }

  function selectElementContents(el) {
    try {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    catch (err) {
    }
  }

  setupCancel();

  return {
    createAdminUser: self.createAdminUser,
    login: self.login,
    createUser: self.createUser,
    updateUser: self.updateUser,
    createRole: self.createRole,
    updateRole: self.updateRole,
    changePassword: self.changePassword,
    createTeam: self.createTeam,
    updateTeam: self.updateTeam,
    createKey: self.createKey,
    updateKey: self.updateKey,
    createApp: self.createApp,
    updateApp: self.updateApp,
    createAppEnvironment: self.createAppEnvironment,
    updateAppEnvironment: self.updateAppEnvironment,
    createConfiguration: self.createConfiguration,
    configuration: self.configuration,
    getParameterByName: self.getParameterByName,
    deleteItem: self.deleteItem,
    moveUp: self.moveUp,
    moveDown: self.moveDown,
    configurationRetrieval: self.configurationRetrieval,
    search: self.search,
    settings: self.settings,
    revisions: self.revisions,
    compare: self.compare,
    users: self.users,
    appFavourite: self.appFavourite,
    teamFavourite: self.teamFavourite,
    rolePermissionSetup: self.rolePermissionSetup,
    teamPermissionSetup: self.teamPermissionSetup,
    appPermissionSetup: self.appPermissionSetup,
    pagination: self.pagination,
    audit: self.audit
  };
}();