// import { DEBUG } from '../../../../config/app.config'
// import { _HomePage } from '../../../../public/shared/pages/home.page'

// // State
// import { VS_UPDATE_ACTIVE_DRAG_SETS } from '../../../../public/shared/state/vs-shared.actions'

// // Interfaces
// import { DragAndDropSets } from '../../../../public/shared/interfaces/drag-and-drop'

// // State
// import { VS_UPDATE_ACTIVE_DROP_SET } from '../../../../public/shared/state/vs-shared.actions'
// // import { Draggable } from 'nano-drag-and-drop';

// // Debug
// let debug = require('debug')('vs:HomePage')
// DEBUG.instance && debug('Instantiate HomePage')

// export class HomePage extends _HomePage {

//     render() {
//         DEBUG.render && debug('Render HomePage')
//         this.innerHTML = `

//             <h1>Visual Space App</h1>
//             <h2>Home page</h2>

//             <a class="button toggle-dnd" 
//                 n-class="${VS_UPDATE_ACTIVE_DRAG_SETS} : { active: event.detail.Layout }"
//                 onclick="toggleDragAndDropLayout()">
//                 Toggle Drag and Drop layout
//             </a>

//             <a class="button toggle-dnd2"
//                 n-call="${VS_UPDATE_ACTIVE_DRAG_SETS} : this.cssActive(event)"
//                 onclick="toggleDragAndDropLayout()">
//                 Demo n-call css class
//             </a>

//             <div class="info panel first"
//                 n-if="${VS_UPDATE_ACTIVE_DRAG_SETS} : event.detail.Layout">
//                 Drag and drop mode activated
//             </div>

//             <div class="info panel second"
//                 n-for="UPDATE_MOCK_LIST : event.detail">
//                 <div class="item">Test data bind</div>
//             </div>
            
//             <!-- Test n-for="UPDATE_MOCK_LIST : event.detail" -->
//             <vs-main-menu class="mm1" n-call="${VS_UPDATE_ACTIVE_DROP_SET} : this.toggleDrag(event.detail.Layout); this.toggleDrop(event.detail.Layout)">1</vs-main-menu>
//             <vs-main-menu class="mm2" n-call="${VS_UPDATE_ACTIVE_DROP_SET} : this.toggleDrag(event.detail.Layout); this.toggleDrop(event.detail.Layout)">2</vs-main-menu>
//             <vs-main-menu class="mm3" n-call="${VS_UPDATE_ACTIVE_DROP_SET} : this.toggleDrag(event.detail.Layout); this.toggleDrop(event.detail.Layout)">3</vs-main-menu>
//             <vs-main-menu class="mm4" n-call="${VS_UPDATE_ACTIVE_DROP_SET} : this.toggleDrag(event.detail.Layout); this.toggleDrop(event.detail.Layout)">4</vs-main-menu>

//         `

//         nanoBind(this, '.toggle-dnd', '.toggle-dnd2', '.info.panel.first', '.info.panel.second', 'vs-main-menu.mm1', 'vs-main-menu.mm2', 'vs-main-menu.mm3', 'vs-main-menu.mm4')

//         let mockList = [{ a: 1 }, { b: 2 }, { c: 3 }]

//         setTimeout(() => {
//             let customEvent = new CustomEvent('UPDATE_MOCK_LIST', {detail: mockList})
//             document.dispatchEvent(customEvent)
//         }, 1000)

//         setTimeout(() => {
//             mockList.shift()
//             let customEvent = new CustomEvent('UPDATE_MOCK_LIST', {detail: mockList})
//             document.dispatchEvent(customEvent)
//         }, 3000)

//     }
    
//     cssActive = function ({detail}: VsEvent<DragAndDropSets>) {
//         detail.Layout === true ? this.classList.add('active') : this.classList.remove('active')
//     }
    
// }

// // Component
// require('./home.page.scss')
// window.customElements.define('vs-home-page', HomePage)