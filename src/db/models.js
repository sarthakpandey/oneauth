/**
 * Created by championswimmer on 08/03/17.
 */
const Sequelize = require('sequelize')
const config = require('../../config')
const secrets = config.SECRETS
const debug = require('debug')('sql:models')

const db_name = secrets.DB.NAME
const db_user = secrets.DB.USER
const db_pass = secrets.DB.PASSWORD
const db_host = secrets.DB.HOST
const db_port = secrets.DB.PORT || "5432"
const db_ssl = secrets.DB.SSL

const DATABASE_URL =
    process.env.DATABASE_URL ||
    (`postgres://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`)

debug('Connecting to ' + DATABASE_URL)

const db = new Sequelize(DATABASE_URL, {
    ssl: db_ssl || false,
    dialectOptions: {
        ssl: db_ssl || false
    },
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    logging: config.DEBUG ? console.log : false
})

const definitions = {
    social: require('./definitions/social'),
    demographics: require('./definitions/demographics')
}

const User = db.define('user', {
    id: {type: Sequelize.DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    username: {type: Sequelize.DataTypes.STRING, unique: true, allowNull: false},
    firstname: Sequelize.DataTypes.STRING,
    lastname: Sequelize.DataTypes.STRING,
    gender: {type: Sequelize.DataTypes.ENUM('MALE', 'FEMALE', 'UNDISCLOSED'), default: 'UNDISCLOSED'},
    photo: Sequelize.DataTypes.STRING,
    email: Sequelize.DataTypes.STRING,
    mobile_number: {type: Sequelize.DataTypes.STRING},
    role: {type: Sequelize.DataTypes.ENUM('admin', 'employee', 'intern'), allowNull: true},
    verifiedemail: {type: Sequelize.DataTypes.STRING, defaultValue: null, unique: true, allowNull: true},
    verifiedmobile: {type: Sequelize.DataTypes.STRING, defaultValue: null, unique: true, allowNull: true}
}, {
    paranoid: true
})

const Resetpassword = db.define('resetpassword', {
    id: {type: Sequelize.DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
    key: {type: Sequelize.DataTypes.STRING, unique: true, allowNull: false},
}, {
    paranoid: true
})

const Verifyemail = db.define('verifyemail', {
    id: {type: Sequelize.DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
    key: {type: Sequelize.DataTypes.STRING, unique: true, allowNull: false},
    returnTo: {type: Sequelize.DataTypes.TEXT}
}, {
    paranoid: true
})

const VerifyMobile = db.define('verifymobile', {
    id: {type: Sequelize.DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
    key: {type: Sequelize.DataTypes.STRING, allowNull: false},
    mobile_number: {type: Sequelize.DataTypes.STRING(15), unique: true, allowNull: false},
}, {
    paranoid: true
});


const UserMobileOTP = db.define('usermobileotp', {
    id: {type: Sequelize.DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
    login_otp: {type: Sequelize.DataTypes.STRING, allowNull: false},
    mobile_number: {type: Sequelize.DataTypes.STRING(15), unique: false, allowNull: false},
    used_at: {type: Sequelize.DataTypes.DATE, allowNull: true}
}, {
    paranoid: true
});

const UserLocal = db.define('userlocal', definitions.social.local)
const UserFacebook = db.define('userfacebook', definitions.social.facebook)
const UserTwitter = db.define('usertwitter', definitions.social.twitter)
const UserGithub = db.define('usergithub', definitions.social.github)
const UserGoogle = db.define('usergoogle', definitions.social.google)
const UserLinkedin = db.define('userlinkedin', definitions.social.linkedin)
const UserLms = db.define('userlms', definitions.social.lms)

UserLocal.belongsTo(User)
User.hasOne(UserLocal, {foreignKey: {unique: true}})

UserFacebook.belongsTo(User)
User.hasOne(UserFacebook, {foreignKey: {unique: true}})

UserTwitter.belongsTo(User)
User.hasOne(UserTwitter, {foreignKey: {unique: true}})

UserGithub.belongsTo(User)
User.hasOne(UserGithub, {foreignKey: {unique: true}})

UserGoogle.belongsTo(User)
User.hasOne(UserGoogle, {foreignKey: {unique: true}})

UserLinkedin.belongsTo(User)
User.hasOne(UserLinkedin, {foreignKey: {unique: true}})

UserLms.belongsTo(User)
User.hasOne(UserLms, {foreignKey: {unique: true}})

Resetpassword.belongsTo(User)
Verifyemail.belongsTo(User)
VerifyMobile.belongsTo(User)
UserMobileOTP.belongsTo(User)

const Client = db.define('client', {
    id: {type: Sequelize.DataTypes.BIGINT, primaryKey: true},
    name: Sequelize.DataTypes.STRING,
    secret: Sequelize.DataTypes.STRING,
    domain: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
    callbackURL: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
    webhookURL: {type: Sequelize.DataTypes.STRING, default: null},
    trusted: {type: Sequelize.DataTypes.BOOLEAN, default: false},
    defaultURL: {type: Sequelize.DataTypes.STRING, allowNull: false, default: 'https://codingblocks.com/'},
})

Client.belongsTo(User)
User.hasMany(Client)

const Organisation = db.define('organisation', {
    id: {type: Sequelize.DataTypes.INTEGER, primaryKey: true},
    name: {type: Sequelize.DataTypes.STRING, allowNull: false},
    full_name: {type: Sequelize.DataTypes.STRING, allowNull: false},
    domain: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
    website: Sequelize.DataTypes.STRING
})

const OrgAdmin = db.define('orgadmin', {
    organisationId: Sequelize.DataTypes.INTEGER,
    userId: Sequelize.DataTypes.BIGINT
})

User.belongsToMany(Organisation, {
    through: {
        model: OrgAdmin,
        unique: false
    }
})

Organisation.belongsToMany(User, {
    through: {
        model: OrgAdmin,
        unique: false
    }
})

const OrgMember = db.define('orgmember', {
    organisationId: Sequelize.DataTypes.INTEGER,
    userId: Sequelize.DataTypes.BIGINT,
    email: Sequelize.DataTypes.STRING
})

User.belongsToMany(Organisation, {
    through: {
        model: OrgMember,
        unique: false
    }
})

Organisation.belongsToMany(User, {
    through: {
        model: OrgMember,
        unique: false
    }
})

const GrantCode = db.define('grantcode', {
    code: {type: Sequelize.DataTypes.STRING, primaryKey: true}
})

GrantCode.belongsTo(User)
User.hasMany(GrantCode)

GrantCode.belongsTo(Client)
Client.hasMany(GrantCode)


const AuthToken = db.define('authtoken', {
    token: {type: Sequelize.DataTypes.STRING, primaryKey: true},
    scope: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
    explicit: {type: Sequelize.DataTypes.BOOLEAN, default: false}
})

AuthToken.belongsTo(User)
User.hasMany(AuthToken)

AuthToken.belongsTo(Client)
Client.hasMany(AuthToken)

const Demographic = db.define('demographic', {})

Demographic.belongsTo(User)     // Demographic has userId
User.hasOne(Demographic)        // One user has only one demographic, so userId is UNIQUE

const Address = db.define('address', definitions.demographics.address, {
    indexes: [
        {
            name: 'unique_primary_address_index',
            unique: true,
            fields: ['demographicId'],
            where: {primary: true}
        }
    ]
})
const State = db.define('state', definitions.demographics.state)
const Country = db.define('country', definitions.demographics.country)
const College = db.define('college', definitions.demographics.college)
const Company = db.define('company', definitions.demographics.company)
const Branch = db.define('branch', definitions.demographics.branch)

State.belongsTo(Country)
Country.hasMany(State)

Address.belongsTo(State)
State.hasMany(Address)

Address.belongsTo(Country)
Country.hasMany(Address)


// "Demographic" is the demographic of 'one' user

Address.belongsTo(Demographic) //address will have demographicId
Demographic.hasMany(Address)   //user can have multiple Address


Demographic.belongsTo(College)
College.hasMany(Demographic)

Demographic.belongsTo(Company)
Company.hasMany(Demographic)

Demographic.belongsTo(Branch)
Branch.hasMany(Demographic)

const EventSubscription = db.define('event_subscription', {
    id: {type: Sequelize.DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    clientId: {type: Sequelize.DataTypes.BIGINT, references: {model: 'clients', key: 'id'}},
    model: {type: Sequelize.DataTypes.ENUM('user', 'client', 'address', 'demographic')},
    type: {type: Sequelize.DataTypes.ENUM('create', 'update', 'delete')}
})

if (!process.env.ONEAUTH_DB_NO_SYNC) {
    db.sync({
        alter: process.env.ONEAUTH_ALTER_TABLES || false,
        force: process.env.ONEAUTH_DROP_TABLES || (config.DEPLOY_CONFIG === 'heroku'), // Clear DB on each run on heroku
    }).then(() => {
        console.log('Database configured')
    }).catch(err =>
        console.error(err)
    )
}


module.exports = {
    models: {
        User,
        UserLocal,
        UserFacebook,
        UserTwitter,
        UserGithub,
        UserGoogle,
        UserLinkedin,
        UserLms,
        Client,
        Organisation,
        OrgAdmin,
        OrgMember,
        GrantCode,
        AuthToken,
        Resetpassword,
        Verifyemail,
        Demographic,
        Address,
        College,
        Company,
        Branch,
        State,
        Country,
        EventSubscription,
        VerifyMobile,
        UserMobileOTP
    },
    db
};
