###
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
###






AUTH_ADRESS = "127.0.0.1"
AUTH_PORT = 444

DOFUS_VERSION = "1.29.1"

DATABASE_USER = "root"
DATABASE_PASSWORD = ""
DATABASE_DB = "arkalia_realm"






###
	Network class
###

class AuthNetServer
  constructor: (@ip, @port) ->
    net = require('net')
    @Server = net.createServer (event) =>
        this.onConnection(event)

  Start: () ->
    @Server.listen(AUTH_PORT, AUTH_ADRESS)

  onConnection: (event) ->
    console.log('New input connection on authserver')
    event.pipe(event);
    client = new AuthNetClient(event)

class AuthNetClient
    constructor: (@socket) ->
        @state = 0
        @encryptKey = GenerateString(32)
        @socket.on 'close', (event) =>
            this.onClose(event)
        @socket.on 'data', (event) =>
            this.onReceiveData(event)
        @Send('HC' + @encryptKey)

    Send: (packet) ->
        console.log('Send packet => ' + packet)
        @socket.write(packet + "\x00")

    onReceiveData: (event) ->
        data = CleanPacket(event.toString())
        @handlePacket(x) for x in data

    onClose: (event) ->
        console.log('Client disconnected')

    handlePacket: (packet) ->
        if packet != "" and packet != "Af"
            console.log('Received packet <= ' + packet)
            switch @state
                when 0
                    @checkVersion(packet)
                when 1
                    @checkAccount(packet)


    checkVersion: (packet) -> #Check client version
        if packet == DOFUS_VERSION
            @state = 1
        else
            @state = -1
            @Send('AlEv' + DOFUS_VERSION)

    checkAccount: (packet) -> #Check client account requested
        @state = -1
        data = packet.split('#1')
        username = data[0]
        password = data[1]



###
    Client methods
###

class Account
    constructor: () ->
        @id = -1
        @username = ""
        @password = ""

    GetMd5Password: (sipher) ->





###
    Utilities methods
###

UtilsHash = 'azertyuiopqsdfghjklmwxcvbn'

RandNumber = (min, max) ->
    return Math.floor(Math.random() * (max - min + 1)) + min

GenerateString = (lenght) ->
    rndStr = ""
    rndStr += UtilsHash.charAt(RandNumber(0, 25)) for x in [1..lenght]
    return rndStr

CleanPacket = (packet) ->
    return packet.replace("\x0a", "").replace("\n", "").split("\x00")










###
    Database Methods
###



ConnectDatabase = () ->
    MySQL.auto_prepare = true;
    MySQL.auth(DATABASE_DB, DATABASE_USER, DATABASE_PASSWORD);
    console.log('Connected to database !')

GetAccountFromSQL = (username) ->
    query = "SELECT * FROM accounts WHERE Username='" + username + "'"
    MySQL.query(query).addListener 'row', (r) =>
        console.dir(r)
        

###
	Start Program Methods
###

AuthServer = null
MySQL = require 'mysql'

Main = () ->
    WritePlatformInformations()
    StartDatabaseServices()
    StartNetWorkServices()
    GetAccountFromSQL('test')

WritePlatformInformations = () ->
    console.log("Your node.js details:")
    console.log("Version: " + process.version)
    console.log("Platform: " + process.platform)
    console.log("Architecture: " + process.arch)

StartDatabaseServices = () ->
    console.log('Starting database services ...')
    MySQL = require('mysql-native').createTCPClient();
    ConnectDatabase()
    #MySQLProvider = mysql.createConnection({host     : '127.0.0.1', user     : 'root',password : '', })


StartNetWorkServices = () ->
    console.log('Starting network services ...')
    AuthServer = new AuthNetServer(AUTH_ADRESS, AUTH_PORT)
    AuthServer.Start()

Main()#Need to start emulator