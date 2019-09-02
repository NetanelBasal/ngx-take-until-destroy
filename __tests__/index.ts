import { Subject } from 'rxjs';

import { untilDestroyed } from '../src/take-until-destroy';

function createObserver() {
  return {
    next: jest.fn(),
    error: jest.fn(),
    complete: jest.fn()
  };
}

describe('untilDestroyed', () => {
  it('should not destroy other instances', () => {
    const spy = createObserver();
    const spy2 = createObserver();

    class Test {
      obs;

      destroy() {}

      subscribe(spy) {
        this.obs = new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy);
      }
    }

    const component1 = new Test();
    const component2 = new Test();
    component1.subscribe(spy);
    component2.subscribe(spy2);
    component1.destroy();
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(spy2.complete).not.toHaveBeenCalled();
    component2.destroy();
    expect(spy2.complete).toHaveBeenCalledTimes(1);
  });

  it('should work with multiple observables', () => {
    const spy = createObserver();
    const spy2 = createObserver();
    const spy3 = createObserver();

    class Test {
      obs = new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy);
      obs2 = new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy2);
      obs3 = new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy3);

      destroy() {}
    }

    const instance = new Test();
    instance.destroy();
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(spy2.complete).toHaveBeenCalledTimes(1);
    expect(spy3.complete).toHaveBeenCalledTimes(1);
  });

  it('should work with classes that are not components', () => {
    const spy = createObserver();

    class Test {
      obs = new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy);

      destroy() {
        console.log('called');
      }
    }

    const instance = new Test();
    instance.destroy();
    expect(spy.complete).toHaveBeenCalledTimes(1);
  });
});

describe('it should work anywhere', () => {
  const spy = createObserver();
  const spy2 = createObserver();
  const spy3 = createObserver();

  class LoginComponent {
    dummy = new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy);

    constructor() {
      new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy2);
    }

    ngOnInit() {
      new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy3);
    }

    destroy() {}
  }

  it('should unsubscribe', () => {
    const instance = new LoginComponent();
    instance.ngOnInit();
    instance.destroy();
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(spy2.complete).toHaveBeenCalledTimes(1);
    expect(spy3.complete).toHaveBeenCalledTimes(1);
  });
});

describe('inheritance', () => {
  it('should work with subclass', () => {
    const spy = createObserver();

    class Parent {
      destroy() {}
    }

    class Child extends Parent {
      constructor() {
        super();
      }
      obs = new Subject().pipe(untilDestroyed(this, 'destroy')).subscribe(spy);
    }

    const instance = new Child();
    instance.destroy();
    expect(spy.complete).toHaveBeenCalledTimes(1);
  });
});

describe('Ivy compatibility', () => {
  it('should work with Ivy components', () => {
    const spy = createObserver();

    class LoginComponent {
      static ngComponentDef = {
        onDestroy: null
      };

      stream$ = new Subject().pipe(untilDestroyed(this)).subscribe(spy);
    }

    const component = new LoginComponent();
    expect(component.stream$.closed).toBeFalsy();
    LoginComponent.ngComponentDef.onDestroy.call(component);
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(component.stream$.closed).toBeTruthy();
  });

  it('should work with Ivy directives', () => {
    const spy = createObserver();

    class LoginDirective {
      static ngDirectiveDef = {
        onDestroy: null
      };

      stream$ = new Subject().pipe(untilDestroyed(this)).subscribe(spy);
    }

    const directive = new LoginDirective();
    expect(directive.stream$.closed).toBeFalsy();
    LoginDirective.ngDirectiveDef.onDestroy.call(directive);
    expect(spy.complete).toHaveBeenCalledTimes(1);
    expect(directive.stream$.closed).toBeTruthy();
  });
});
