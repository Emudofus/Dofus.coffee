// Generated by CoffeeScript 1.3.3

/*
    Ce fichier est une partie du projet Dofus.coffee

    Dofus.coffee est un logiciel libre : vous pouvez redistribué et/ou modifié
    les sources sous les thermes de la General Public License (GNU) publié par
    la Free Software Foundation, ou bien de la version 3 de la license ou tout
    autre version antérieur.
    
    Dofus.coffee est distribué dans la volonté d'être utile SANS AUCUNE GARANTIE, 
	néanmoins en aucun cas il ne doit pas ETRE UTILISE OU DISTRIBUE A DES FINS COMMERCIALES,
    voir la General Public License (GNU) pour plus de détails.

    Un copie de la General Public License (GNU) est distribué avec le logiciel Dofus.coffee
    En cas contraire visitez : <http://www.gnu.org/licenses/>.
  
    Dofus.coffee Copyright (C) 2010 NightWolf & Dofus.coffee Team — Tous droits réservés.
	Créé par NightWolf
*/


(function() {
  var AUTH_ADRESS, AUTH_PORT, Account, AuthNetClient, AuthNetServer, AuthServer, CleanPacket, ConnectDatabase, DATABASE_DB, DATABASE_PASSWORD, DATABASE_USER, DOFUS_VERSION, GenerateString, Main, MySQL, RandNumber, StartDatabaseServices, StartNetWorkServices, UtilsHash, WritePlatformInformations;

  AUTH_ADRESS = "127.0.0.1";

  AUTH_PORT = 444;

  DOFUS_VERSION = "1.29.1";

  DATABASE_USER = "root";

  DATABASE_PASSWORD = "";

  DATABASE_DB = "arkalia_realm";

  /*
  	Network class
  */


  AuthNetServer = (function() {

    function AuthNetServer(ip, port) {
      var net,
        _this = this;
      this.ip = ip;
      this.port = port;
      net = require('net');
      this.Server = net.createServer(function(event) {
        return _this.onConnection(event);
      });
    }

    AuthNetServer.prototype.Start = function() {
      return this.Server.listen(AUTH_PORT, AUTH_ADRESS);
    };

    AuthNetServer.prototype.onConnection = function(event) {
      var client;
      console.log('New input connection on authserver');
      event.pipe(event);
      return client = new AuthNetClient(event);
    };

    return AuthNetServer;

  })();

  AuthNetClient = (function() {

    function AuthNetClient(socket) {
      var _this = this;
      this.socket = socket;
      this.state = 0;
      this.encryptKey = GenerateString(32);
      this.socket.on('close', function(event) {
        return _this.onClose(event);
      });
      this.socket.on('data', function(event) {
        return _this.onReceiveData(event);
      });
      this.Send('HC' + this.encryptKey);
    }

    AuthNetClient.prototype.Send = function(packet) {
      console.log('Send packet => ' + packet);
      return this.socket.write(packet + "\x00");
    };

    AuthNetClient.prototype.onReceiveData = function(event) {
      var data, x, _i, _len, _results;
      data = CleanPacket(event.toString());
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        x = data[_i];
        _results.push(this.handlePacket(x));
      }
      return _results;
    };

    AuthNetClient.prototype.onClose = function(event) {
      return console.log('Client disconnected');
    };

    AuthNetClient.prototype.handlePacket = function(packet) {
      if (packet !== "" && packet !== "Af") {
        console.log('Received packet <= ' + packet);
        switch (this.state) {
          case 0:
            return this.checkVersion(packet);
          case 1:
            return this.checkAccount(packet);
        }
      }
    };

    AuthNetClient.prototype.checkVersion = function(packet) {
      if (packet === DOFUS_VERSION) {
        return this.state = 1;
      } else {
        this.state = -1;
        return this.Send('AlEv' + DOFUS_VERSION);
      }
    };

    AuthNetClient.prototype.checkAccount = function(packet) {
      var data, password, username;
      this.state = -1;
      data = packet.split('#1');
      username = data[0];
      return password = data[1];
    };

    return AuthNetClient;

  })();

  /*
      Client methods
  */


  Account = (function() {

    function Account() {
      this.id = -1;
      this.username = "";
      this.password = "";
    }

    Account.prototype.GetMd5Password = function(sipher) {};

    Account.FindByUsername = function(username, callback) {
      var account, query,
        _this = this;
      query = "SELECT * FROM accounts WHERE Username='" + username + "'";
      account = null;
      return MySQL.query(query).addListener('row', function(r) {
        account = new Account();
        account.id = r.Id;
        account.username = r.Username;
        account.password = r.Password;
        return callback.call(callback, account);
      });
    };

    return Account;

  })();

  /*
      Utilities methods
  */


  UtilsHash = 'azertyuiopqsdfghjklmwxcvbn';

  RandNumber = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  GenerateString = function(lenght) {
    var rndStr, x, _i;
    rndStr = "";
    for (x = _i = 1; 1 <= lenght ? _i <= lenght : _i >= lenght; x = 1 <= lenght ? ++_i : --_i) {
      rndStr += UtilsHash.charAt(RandNumber(0, 25));
    }
    return rndStr;
  };

  CleanPacket = function(packet) {
    return packet.replace("\x0a", "").replace("\n", "").split("\x00");
  };

  /*
      Database Methods
  */


  ConnectDatabase = function() {
    MySQL.auto_prepare = true;
    MySQL.auth(DATABASE_DB, DATABASE_USER, DATABASE_PASSWORD);
    return console.log('Connected to database !');
  };

  /*
  	Start Program Methods
  */


  AuthServer = null;

  MySQL = require('mysql');

  Main = function() {
    var account;
    WritePlatformInformations();
    StartDatabaseServices();
    StartNetWorkServices();
    return account = Account.FindByUsername('test', function(account) {
      return console.log(account);
    });
  };

  WritePlatformInformations = function() {
    console.log("Your node.js details:");
    console.log("Version: " + process.version);
    console.log("Platform: " + process.platform);
    return console.log("Architecture: " + process.arch);
  };

  StartDatabaseServices = function() {
    console.log('Starting database services ...');
    MySQL = require('mysql-native').createTCPClient();
    return ConnectDatabase();
  };

  StartNetWorkServices = function() {
    console.log('Starting network services ...');
    AuthServer = new AuthNetServer(AUTH_ADRESS, AUTH_PORT);
    return AuthServer.Start();
  };

  Main();

}).call(this);
