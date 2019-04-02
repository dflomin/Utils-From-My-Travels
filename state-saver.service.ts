import { Inject, Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

// To save certain selections across all pages, which have their own options, this state manager is used.
@Injectable()
export class StateSaverService {
  private stateSaver = {};

  /**
   * Creates a new parent state if it doesn't already exist, and sets
   * the new state to the stateProperties defined.
   * Does NOT create a duplicate state.
   * @param  {string}               stateParent     [The name of the page, typically]
   * @param  {string}               stateProperties [Default properties]
   * @return {BehaviorSubject<any>} [Returns the BehaviorSubject created]
   */
  public createState(stateParent: string, stateProperties: object): BehaviorSubject<any> {
    if (!this.stateSaver[stateParent]) {
      this.stateSaver[stateParent] = new BehaviorSubject({});
    }

    const state = this.stateSaver[stateParent].getValue();
    for (let property of Object.keys(stateProperties)) {
      if (state[property] === undefined) {
        state[property] = stateProperties[property];
      }
      else {
        // This is a convenient place to automatically update
        // the component's default state to whatever is stored
        // in this state preserver.
        stateProperties[property] = state[property];
      }
    }

    this.stateSaver[stateParent].next(state);
    return this.stateSaver[stateParent];
  }

  /**
   * Returns the BS of the requested state name. 
   * Returns the -value- of the BS is second arg is set to true
   * @param {value?} To return as a value instead of a BS 
   * @return {BehaviorSubject<any> | object}
   */
  public getState(stateParent: string, value?: boolean) {
    if (this.stateSaver[stateParent] && value === true)
      return Object.assign({}, this.stateSaver[stateParent].getValue());
    else
      return this.stateSaver[stateParent];
  }

  /**
   * Requires the stateParent to already exist. If it does not, returns null.
   * Any properties in stateProperties not previously in stateParent will automatically be added.
   * @return {any} Returns the modified state property.
   */
  public setState(stateParent: string, stateProperties: object): any {
    if (!this.stateSaver[stateParent])
      return null;

    let newState = this.stateSaver[stateParent].getValue();
    for (let key of Object.keys(stateProperties)) {
      newState[key] = stateProperties[key];
    }

    this.stateSaver[stateParent].next(newState);   

    return this.stateSaver[stateParent].getValue(); 
  }

  /**
   * Handy util method to check if a state has actually changed - on some occasions,
   * the BS will fire an event even though nothing has changed. This is a failsafe.
   * Due to the nature of our application, the exclusions @param is handy to exclude
   * certain values from being checked in this loop. 
   */
  public recordIfChanged(oldData: object, newData: object, exclusions?: string[]) {
    exclusions = exclusions || [];
    let change = false;
    for (let key of Object.keys(newData)) {
      if (oldData && oldData[key] && newData[key] !== oldData[key] && exclusions.indexOf(key) === -1) {
        oldData[key] = newData[key];
        change = true;
      }
    }

    return change;
  }

  public resetAllStates(): void {
    this.stateSaver = {};
  }
}
