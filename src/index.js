import Connection from './connection';

export default {
  createConnection(options = {}) {
    if (!options.name) throw new Error('miss options.name, name is required.');
    if (!options.version) throw new Error('miss options.version, version is required.');
    if (!options.desc) options.desc = options.name + ' database';
    if (!options.size) options.size = 10 * 1024 * 1024;
    return new Connection(options);
  }
}