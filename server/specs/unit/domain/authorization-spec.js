const expect = require('chai').expect;

const models = require('../../../models');
const authorization = require('../../../domain/authorization');

let settings = undefined;

const authorizationInstance = authorization({
  settings: {
    find: () => {
      return new Promise((resolve) => {
        return resolve(settings);
      });
    }
  }
});

describe('domain - authorization', () => {

  beforeEach(() => {
    settings = {
      isNull: () => {
        return true;
      }
    }
  });

  describe('changeSettings', () => {

    describe('returns true', () => {

      it('if user is "admin"', (done) => {
        const user = new models.user({ userName: 'admin' });

        authorizationInstance.changeSettings(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

      it('if user role is "administrator"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['administrator'] });

        authorizationInstance.changeSettings(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user role is "user"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['user'] });

        authorizationInstance.changeSettings(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('createAUser', () => {

    describe('returns true', () => {

      it('if user is "admin"', (done) => {
        const user = new models.user({ userName: 'admin' });

        authorizationInstance.createAUser(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

      it('if user role is "administrator"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['administrator'] });

        authorizationInstance.createAUser(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user role is "user"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['user'] });

        authorizationInstance.createAUser(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('updateAUser', () => {

    describe('returns true', () => {

      it('if user is "admin"', (done) => {
        const user = new models.user({ userName: 'admin' });

        authorizationInstance.updateAUser(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

      it('if user role is "administrator"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['administrator'] });

        authorizationInstance.updateAUser(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user role is "user"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['user'] });

        authorizationInstance.updateAUser(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

    });
  });

  describe('changeAPassword', () => {

    describe('returns true', () => {

      describe('when ldap disabled', () => {

        beforeEach(() => {
          settings = {
            isNull: () => {
              return false;
            },
            ldapEnabled: false
          }
        });

        it('if user is "admin"', (done) => {
          const user = new models.user({ userName: 'admin' });

          authorizationInstance.changeAPassword(user, { userId: '124' })
            .then((result) => {
              expect(result).to.eql(true);
              done();
            });
        });

        it('if user role is "administrator"', (done) => {
          const user = new models.user({ userName: 'test', roles: ['administrator'] });

          authorizationInstance.changeAPassword(user, { userId: '124' })
            .then((result) => {
              expect(result).to.eql(true);
              done();
            });
        });

        it('if user is logged in user', (done) => {
          const user = new models.user({ userId: '123', userName: 'test', roles: ['user'] });

          authorizationInstance.changeAPassword(user, { userId: '123' })
            .then((result) => {
              expect(result).to.eql(true);
              done();
            });
        });
      });

    });

    describe('returns false', () => {

      describe('when ldap enabled', () => {

        beforeEach(() => {
          settings = {
            isNull: () => {
              return false;
            },
            ldapEnabled: true
          }
        });

        it('if user is "admin"', (done) => {
          const user = new models.user({ userName: 'admin' });

          authorizationInstance.changeAPassword(user, { userId: '124' })
            .then((result) => {
              expect(result).to.eql(false);
              done();
            });
        });

        it('if user role is "administrator"', (done) => {
          const user = new models.user({ userName: 'test', roles: ['administrator'] });

          authorizationInstance.changeAPassword(user, { userId: '124' })
            .then((result) => {
              expect(result).to.eql(false);
              done();
            });
        });

        it('if user is logged in user', (done) => {
          const user = new models.user({ userId: '123', userName: 'test', roles: ['user'] });

          authorizationInstance.changeAPassword(user, { userId: '123' })
            .then((result) => {
              expect(result).to.eql(false);
              done();
            });
        });
      });

      it('if user role is "user"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['user'] });

        authorizationInstance.changeAPassword(user, { userId: '124' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user is not logged in user', (done) => {
        const user = new models.user({ userId: '123', userName: 'test', roles: ['user'] });

        authorizationInstance.changeAPassword(user, { userId: '124'})
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('createATeam', () => {

    describe('returns true', () => {

      it('if user role is "administrator"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['administrator'] });

        authorizationInstance.createATeam(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

      it('if user role is "team-writer"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['team-writer'] });

        authorizationInstance.createATeam(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const user = new models.user({ userName: 'admin', roles: ['administrator'] });

        authorizationInstance.createATeam(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "user"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['user'] });

        authorizationInstance.createATeam(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('updateATeam', () => {

    describe('returns true', () => {

      it('if user role is "administrator"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['administrator'] });

        authorizationInstance.updateATeam(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

      it('if user role is "team-writer"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['team-writer'] });

        authorizationInstance.updateATeam(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const user = new models.user({ userName: 'admin', roles: ['administrator'] });

        authorizationInstance.updateATeam(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "user"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['user'] });

        authorizationInstance.updateATeam(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('createAnApp', () => {

    describe('returns true', () => {

      it('if user has a team write permission for the team', (done) => {

        const teamId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          teamPermissions: [
            new models.teamPermission({
              id: teamId,
              write: true
            })
          ]
        });

        authorizationInstance.createAnApp(user, { teamId })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const teamId = '123';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          teamPermissions: []
        });

        authorizationInstance.createAnApp(user, { teamId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "administrator"', (done) => {
        const teamId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          teamPermissions: []
        });

        authorizationInstance.createAnApp(user, { teamId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('updateAnApp', () => {

    describe('returns true', () => {

      it('if user has a team write permission for the team', (done) => {

        const teamId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          teamPermissions: [
            new models.teamPermission({
              id: teamId,
              write: true
            })
          ]
        });

        authorizationInstance.updateAnApp(user, { teamId })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const teamId = '123';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          teamPermissions: []
        });

        authorizationInstance.updateAnApp(user, { teamId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "administrator"', (done) => {
        const teamId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          teamPermissions: []
        });

        authorizationInstance.updateAnApp(user, { teamId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('readAnApp', () => {

    describe('returns true', () => {

      it('if user has a read permission for the app', (done) => {

        const appId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              read: true
            })
          ]
        });

        authorizationInstance.readAnApp(user, { appId })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const appId = '123';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          appConfigurationPermissions: []
        });

        authorizationInstance.readAnApp(user, { appId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "administrator"', (done) => {
        const appId = '123';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          appConfigurationPermissions: []
        });

        authorizationInstance.readAnApp(user, { appId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('createAnAppEnvironment', () => {

    describe('returns true', () => {

      it('if user has a team write permission for the team', (done) => {

        const teamId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          teamPermissions: [
            new models.teamPermission({
              id: teamId,
              write: true
            })
          ]
        });

        authorizationInstance.createAnAppEnvironment(user, { teamId })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const teamId = '123';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          teamPermissions: []
        });

        authorizationInstance.createAnAppEnvironment(user, { teamId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "administrator"', (done) => {
        const teamId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          teamPermissions: []
        });

        authorizationInstance.createAnAppEnvironment(user, { teamId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('updateAnAppEnvironment', () => {

    describe('returns true', () => {

      it('if user has a team write permission for the team', (done) => {

        const teamId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          teamPermissions: [
            new models.teamPermission({
              id: teamId,
              write: true
            })
          ]
        });

        authorizationInstance.updateAnAppEnvironment(user, { teamId })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const teamId = '123';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          teamPermissions: []
        });

        authorizationInstance.updateAnAppEnvironment(user, { teamId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "administrator"', (done) => {
        const teamId = '123';

        const user = new models.user({
          userName: 'test',
          roles: ['administrator'],
          teamPermissions: []
        });

        authorizationInstance.updateAnAppEnvironment(user, { teamId })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('createAConfiguration', () => {

    describe('returns true', () => {

      it('if user has a write permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              write: true
            })
          ]
        });

        authorizationInstance.createAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user has a write permission for the app and but different environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              write: true
            })
          ]
        });

        authorizationInstance.createAConfiguration(user, { appId, environment: 'test' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user is "admin"', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              write: true
            })
          ]
        });

        authorizationInstance.createAConfiguration(user, { appId, environment: 'prod' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user has a read permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              read: true
            })
          ]
        });

        authorizationInstance.createAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('updateAConfiguration', () => {

    describe('returns true', () => {

      it('if user has a write permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              write: true
            })
          ]
        });

        authorizationInstance.updateAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user has a write permission for the app and but different environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              write: true
            })
          ]
        });

        authorizationInstance.updateAConfiguration(user, { appId, environment: 'test' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user is "admin"', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              write: true
            })
          ]
        });

        authorizationInstance.updateAConfiguration(user, { appId, environment: 'prod' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user has a read permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              read: true
            })
          ]
        });

        authorizationInstance.updateAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('readAConfiguration', () => {

    describe('returns true', () => {

      it('if user has a read permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              read: true
            })
          ]
        });

        authorizationInstance.readAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user has a read permission for the app and but different environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              read: true
            })
          ]
        });

        authorizationInstance.readAConfiguration(user, { appId, environment: 'test' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user is "admin"', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              read: true
            })
          ]
        });

        authorizationInstance.updateAConfiguration(user, { appId, environment: 'prod' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user has a write but no read permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              read: false,
              write: true
            })
          ]
        });

        authorizationInstance.readAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });
  
  describe('publishAConfiguration', () => {

    describe('returns true', () => {

      it('if user has a publish permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              publish: true
            })
          ]
        });

        authorizationInstance.publishAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user has a publish permission for the app and but different environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              publish: true
            })
          ]
        });

        authorizationInstance.publishAConfiguration(user, { appId, environment: 'test' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user is "admin"', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              publish: true
            })
          ]
        });

        authorizationInstance.publishAConfiguration(user, { appId, environment: 'prod' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user has a write and read but no publish permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              read: true,
              write: true,
              publish: false
            })
          ]
        });

        authorizationInstance.publishAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('deleteAConfiguration', () => {

    describe('returns true', () => {

      it('if user has a delete permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              delete: true
            })
          ]
        });

        authorizationInstance.deleteAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user has a delete permission for the app and but different environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              delete: true
            })
          ]
        });

        authorizationInstance.deleteAConfiguration(user, { appId, environment: 'test' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user is "admin"', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'admin',
          roles: ['administrator'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              delete: true
            })
          ]
        });

        authorizationInstance.deleteAConfiguration(user, { appId, environment: 'prod' })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user has a write and read and publish but no delete permission for the app and environment', (done) => {

        const appId = '123';
        const environment = 'prod';

        const user = new models.user({
          userName: 'test',
          roles: ['user'],
          appConfigurationPermissions: [
            new models.appConfigurationPermission({
              id: appId,
              environment: environment,
              read: true,
              write: true,
              publish: true,
              delete: false
            })
          ]
        });

        authorizationInstance.deleteAConfiguration(user, { appId, environment })
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('createAKey', () => {

    describe('returns true', () => {

      it('if user role is "administrator"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['administrator'] });

        authorizationInstance.createAKey(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

      it('if user role is "key-writer"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['key-writer'] });

        authorizationInstance.createAKey(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const user = new models.user({ userName: 'admin', roles: ['administrator'] });

        authorizationInstance.createAKey(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "user"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['user'] });

        authorizationInstance.createAKey(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });

  describe('updateAKey', () => {

    describe('returns true', () => {

      it('if user role is "administrator"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['administrator'] });

        authorizationInstance.updateAKey(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });

      it('if user role is "key-writer"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['key-writer'] });

        authorizationInstance.updateAKey(user)
          .then((result) => {
            expect(result).to.eql(true);
            done();
          });
      });
    });

    describe('returns false', () => {

      it('if user is "admin"', (done) => {
        const user = new models.user({ userName: 'admin', roles: ['administrator'] });

        authorizationInstance.updateAKey(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });

      it('if user role is "user"', (done) => {
        const user = new models.user({ userName: 'test', roles: ['user'] });

        authorizationInstance.updateAKey(user)
          .then((result) => {
            expect(result).to.eql(false);
            done();
          });
      });
    });
  });
});