import { Subject } from 'rxjs';
const visibilitySubject = new Subject<string>();

export const componentVisibilityOrchestrator = {
    registerComponentForMenu: (document: any, componentId: string) => {
        const element: any = document.querySelector('#' + componentId);

        let options = {
            root: null,
            rootMargin: '0px',
            threshold: [1],
        };

        let observer = new IntersectionObserver((entries, observer) => {
            console.log('-----------------------------');
            console.log('from intersection observer', componentId);
            console.log('entries', entries);
            console.log('-----------------------------');
            // todo: add a debounce here
            if (entries[0].isIntersecting) {
                visibilitySubject.next(componentId);
            }
        }, options);

        observer.observe(element);
        return observer;
    },
    visibility$: visibilitySubject.asObservable(),
    setActive: (componentId: string) => visibilitySubject.next(componentId),
    registerComponent: (callback: any, options: IntersectionObserverInit) => {
        let observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry: any) => {
                if (entry.isIntersecting) {
                    callback();
                }
            });
        }, options);

        return observer;
    },
};
