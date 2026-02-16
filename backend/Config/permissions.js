const permissionsByRole = {
  SUPER_ADMIN: {
    create: true,
    read: true,
    update: true,
    delete: true,
    hide: true
  },
  ADMIN: {
    create: true,
    read: true,
    update: true,
    delete: false,
    hide: true
  },
  USER: {
    create: true,
    read: true,
    update: false,
    delete: false,
    hide: true
  },
  VIEWER: {
    create: false,
    read: true,
    update: false,
    delete: false,
    hide: false
  }
};

module.exports = permissionsByRole;
