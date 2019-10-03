
import afterCreateConnection from '../../hooks/after-create-connection';
import beforeDeleteConnection from '../../hooks/before-delete-connection';

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [beforeDeleteConnection()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [afterCreateConnection()],
    update: [], // TODO: Should I restart here? afterCreateConnection()
    patch: [], // TODO: Should I restart here? afterCreateConnection()
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
