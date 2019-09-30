
import beforeCreateContract from '../../hooks/before-create-contract';
import afterFindContract from '../../hooks/after-find-contract';

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [beforeCreateContract()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [afterFindContract()],
    get: [afterFindContract()],
    create: [],
    update: [],
    patch: [],
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
