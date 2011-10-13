-------------------------------------------------------------------------------
Node Hierarchy 2 for Drupal 6.x
  by Ronan Dowling, Gorton Studios - ronan (at) gortonstudios (dot) com
-------------------------------------------------------------------------------

Node Hierarchy is a module which allows nodes to be children of other nodes
creating a tree-like hierarchy of content.

The module offers:
  * Automatic hierarchical urls using pathauto
    (eg: http://example.com/aboutus/history/beginning).
  * Automatic creation of hierarchical menus if desired.
  * Optional Views integration.
  * Optional Node Access integration (REMOVED UNTILL NODE ACCESS IS UPDATED)

-------------------------------------------------------------------------------
Installation
------------
Go to administer -> site building -> modules and enable the Node Hierarchy
module.

You must then tell the module which node types can be parents and which can be
children. To do this you can either:
1) Go to administer -> content administration -> content types. Click edit on
the types you want modify and check the "Can be parent" and "Can be child"
checkboxes
-- OR --
2) Go to administer -> settings -> Node Hierarchy and check the boxes in the for
the desired types.

You can also pick a default node for each given type. For example, you can
create a page called "Blogs" and have nodes of type "blog" be a child of that
page by default.

You will also need to assign the following permissions to the appropriate users:

1) create child nodes
   For users who are allowed to create children under existing nodes.
2) edit all node parents
   For users who are allowed to change the parent of any node, regardless of
   authorship.
3) edit own node parents
   For users who are allowed to change the parent of nodes which they have
   authored.
4) reorder children
   For users who are allowed to change the order of children on any node.
5) view site outline
   For users who are allowed to view the site outline
6) administer hierarchy
   For users who are allowed to edit the node hierarchy defaults.


-------------------------------------------------------------------------------
Using Node Hierarchy
--------------------
To assign a parent to a node, either:
1) Create a new node of a type that whose "Can be child" setting is true or edit
   an existing node. Expand the Node Hierarchy fieldset and chose a parent from
   the pulldown.
-- OR --
2) Navigate to the node you wish to make a parent. Click on the children tab,
   and click on one of the create links at the bottom of the tab.

To create a menu for a node:
Edit the node, expand the Node Hierarchy fieldset and check the "Create Menu"
box. Click Submit.
If the node's parent has a menu item, a new menu will be created for the node
under it's parent's menu item. The name of the menu item will be the title of
the node and it's weight will be the node's sort order.

If you edit the parent of a node or it's title, you can recreate an existing
menu item by checking "Recreate Menu". This will set the menu item's parent to
the new parent and the title to the new title. This is not done automatically
on edit, so that you can maintain menu hierarchy separately from node hierarchy
if desired.

If the node does not have a parent or it's parent does not have a menu item, the
new menu item will be a child of the default menu item set in the Node
Hierarchty settings.

Reordering Child Nodes:
Use the green arrow links on the Children tab of the parent node to rearrange
child nodes. This will also update the order of any generated menu items as long
as they have not been moved from their original location.

Token and Pathauto
----------------------
Node Hierarchy integrates with token (and therefore Pathauto 2.x and others).

For Pathauto, the recommended pattern to use is 
  [node:nodehierarchy:parent:url:alias]/[node:title] 
This will give you a hierarchical path which respects automatic and custom paths
for each ancestor up to the top level. 

For example a node with the hierarchical path:
  About us > History > Early Years > 1940s
will have the url:
  about-us/history/early-years/1940s

And if you change the About Us node's path to 'about' the descendant's path will
be 
  about/history/early-years/1940s
All descendant's url paths will need to be regenerated in order to reflect this 
change.

Views
-----
Node hierarchy integrates with Views providing the following:

Arguments:
  Parent Node Id - Takes a node id and returns only nodes which are children of
  that node. Used to provide lists of children for a give node.

Fields:
  Child Weight - The numerical sort order of a child node.

Sort Fields:
  Child Weight - Use this to sort child nodes by their Node Hierarchy sort order.

To enable views integration, turn on the Node Hierarchy Views module. With this
module turned on, you will also be able to embed a view of a node's children on
that node's page.

-------------------------------------------------------------------------------
Node Access
-----------
Node Access integration has been removed from Version 6, as the nodeaccess
module has not been updated to 6 at the time of this writing.

-------------------------------------------------------------------------------
Known Issues
------------
* Settings can break with long content type names.
* Does not respect revisions. Hierarchy settings are revision independant.
* Not tested with pgsql install

-------------------------------------------------------------------------------
TODO
----
* Improve "Can be child" setting to allow admins to specify which node types
  can be children of which node types. (e.g. 'chapter' nodes can only be
  children of 'book' nodes)
-------------------
