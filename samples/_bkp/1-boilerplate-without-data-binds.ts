// import { DEBUG } from '../../config/app.config'

// // Classes
// import { _VisualSpaceApp } from '../../public/visual-space.app'

// // Interfaces
// import { DragAndDropSets } from '../../public/shared/interfaces/drag-and-drop'

// // State
// import { UPDATE_ACTIVE_DRAG_SETS } from '../../public/shared/state/vs-shared.actions'

// // Debug
// let debug = require('debug')('vs:VisualSpaceApp')
// DEBUG.instance && debug('Instantiate VisualSpaceApp')

// // Moving code from one place to another is quite fast using this approach
// export class VisualSpaceApp extends _VisualSpaceApp {

//     refs: Refs = {}

//     // constructor() {
//     //     super()
//     //     document.addEventListener(UPDATE_ACTIVE_DRAG_SETS, this.handleUpdatedActiveDragSet) - SAMPLE
//     // }

//     render() {
//         DEBUG.render && debug('Render VisualSpaceApp')

//         this.innerHTML = `
//             <h1>Visual Space App</h1>
//             <a class="button toggle-dnd" onevent:${UPDATE_ACTIVE_DRAG_SETS}="cssActive(event)"
//                 onclick="toggleDragAndDropLayout()">
//                 Toggle Drag and Drop layout
//             </a>
//             <vs-main-menu class="mm-1">1</vs-main-menu>
//             <vs-main-menu class="mm-2">2</vs-main-menu>
//             <vs-main-menu class="mm-3">3</vs-main-menu>
//             <vs-main-menu class="mm-4">4</vs-main-menu>
//             <vs-main-menu class="mm-5">5</vs-main-menu>
//             <vs-main-menu class="mm-6">6</vs-main-menu>
//             <router-outlet default="home-page"></router-outlet>
//         `
//         bind(this, '.toggle-dnd') // Takes multiple selectors at once :)

        

//         // this.refs.toggleDnd = this.querySelector(`toggle-dnd`) - SAMPLE - Already done by bind
        
//         // this.refs.toggleDnd.addEventListener('click', this.toggleDragAndDropLayout()) - SAMPLE
//         // this.refs.toggleDnd.toggleDragAndDropLayout = this.toggleDragAndDropLayout.bind(this) // OR inline event handler

//         // setTimeout(()=> this.innerHTML = 'All event listeners removed successfully', 1000) - DEMO

//     }

//     // handleUpdatedActiveDragSet = ({ detail }: VsEvent<boolean>) => { - SAMPLE
//     //     this.cssActive.call(this.refs.toggleDnd, detail)
//     // }
        
//     // Updates
//     cssActive = function ({detail}: VsEvent<DragAndDropSets>) {
//         console.log('dndSets', detail)
//         detail.Layout === true ? this.classList.add('active') : this.classList.remove('active')
//     }

//     // disconnectedCallback() { - SAMPLE
//     //     super.disconnectedCallback()
//     //     document.removeEventListener(UPDATE_ACTIVE_DRAG_SETS, this.handleUpdatedActiveDragSet)
//     // }

// }

// // Component
// require('./visual-space.app.scss')
// window.customElements.define('visual-space-app', VisualSpaceApp)