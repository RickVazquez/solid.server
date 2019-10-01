import { Server } from 'http';
import url from 'url';
import axios from 'axios';

import app from '../src/app';
import { buildFakeContractDefinition, buildFakeConnection, Connection, ContractDefinition } from '@solidstudio/solid.types';

const port = app.get('port') || 8998;

const getUrl = (pathname?: string) => url.format({
  hostname: app.get('host') || 'localhost',
  protocol: 'http',
  port,
  pathname
});

describe('Feathers application tests (with jest)', () => {
  let server: Server;

  beforeAll(done => {
    server = app.listen(port);
    server.once('listening', () => done());
  });

  afterAll(done => {
    server.close(done);
  });

  it('starts and shows the index page', async () => {
    expect.assertions(1);

    const { data } = await axios.get(getUrl());

    console.log("DATA", data)

    expect(data.indexOf('Solid Server Running')).not.toBe(-1);
  });

  describe('404', () => {
    it('shows a 404 HTML page', async () => {
      expect.assertions(2);

      try {
        await axios.get(getUrl('path/to/nowhere'), {
          headers: {
            'Accept': 'text/html'
          }
        });
      } catch (error) {
        const { response } = error;

        expect(response.status).toBe(404);
        expect(response.data.indexOf('<html>')).not.toBe(-1);
      }
    });

    it('shows a 404 JSON error without stack trace', async () => {
      expect.assertions(4);

      try {
        await axios.get(getUrl('path/to/nowhere'));
      } catch (error) {
        const { response } = error;

        expect(response.status).toBe(404);
        expect(response.data.code).toBe(404);
        expect(response.data.message).toBe('Page not found');
        expect(response.data.name).toBe('NotFound');
      }
    });
  });

  describe('connections endpoint', () => {

    it('should create a connection', async () => {
      const sampleConnection = buildFakeConnection()
      delete sampleConnection.id

      const url = getUrl('connections');

      await axios.post(url, sampleConnection);

      const { data } = await axios.get(url);

      const connectionsResult: Connection[] = data.data

      expect(data.total).toBeDefined()
      expect(connectionsResult).toBeDefined()
      expect(connectionsResult.length).toBeGreaterThan(0)
    })

  })

  describe('contract definitions  endpoint', () => {
    it('should create a contract definition', async () => {
      const sampleContractDefinition = buildFakeContractDefinition()
      delete sampleContractDefinition.id

      const url = getUrl('contract-definitions');

      await axios.post(url, sampleContractDefinition);

      const { data } = await axios.get(url);

      const contractDefinitionsResult: ContractDefinition[] = data.data

      expect(data.total).toBeDefined()
      expect(contractDefinitionsResult).toBeDefined()
      expect(contractDefinitionsResult.length).toBeGreaterThan(0)

    })
  })
});

// I want to test that when I create a connection
// before there is not data (blocks, transactions, etc)

// but then, it will poll data, populate database, and I assert of what is in the database...