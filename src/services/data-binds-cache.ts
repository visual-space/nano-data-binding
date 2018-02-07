// Interfaces
import { DataBind } from '../interfaces/nano-data-binding'

/**
 * The cache is used to store templates in the order they are intercepted via preprocessing.
 * When the data binds are initiliased (after preprocessing) the tempaltes are retrieved from here using a temporary attribute that stores the id of the template.
 * TODO Improve this cache up to the point where all data binds are stored in a tree structure that perfectly matches the components on screen
 *      Once this tree strcuture is available we are less reliant on the web components to do the entire process
 *      This can open the door for many other architetural improvements such as the NBD base class if it becomes necessary to implement.
 */
export let dataBinds: DataBind[] = []