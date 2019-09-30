
import beforeCreateBlock from '../../hooks/before-create-block';
import afterFindBlock from '../../hooks/after-find-block';

export default {
  before: {
    all: [function (context) { console.log('Before All Hooks!'); }],
    find: [],
    get: [],
    create: [beforeCreateBlock()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [afterFindBlock()],
    get: [afterFindBlock()],
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
