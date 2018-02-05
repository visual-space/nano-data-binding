/**
 * The cache is used to store templates in the order they are discvered by via preprocessing.
 * When the data binds are initiliased (after preprocessing) the tempaltes are retrieved from here using a temporary attribute that stores the id of the template-
 */

// Cache
export let templates: string[] = []