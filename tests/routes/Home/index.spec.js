import HomeRoute from 'routes/Home';

describe('(Route) Home', () => {
  let _route;

  beforeEach(() => {
    _route = HomeRoute({});
  });

  it('Should return a route configuration object', () => {
    expect(typeof _route).to.equal('object');
  });
});
