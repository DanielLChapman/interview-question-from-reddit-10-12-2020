let json = {};
//initialize an empty json object

//initialize a treenode class to hold data
class TreeNode2 {
    //constructors name and data for displaying information
    //parent incase we wanted to backwards traverse
    constructor(name, data, parent) {
        this.name = name;
        this.data = data;
        this.parent = parent;
        this.descendents = {};
    }

    setName(value) {
        this.name = value;
    }
    setData(value) {
        this.data = value;
    }
    setParent(value) {
        this.parent = value;
    }

}

//create a new root object with name: Root, 
let root = new TreeNode2('Root', '', null);

//grabs the url from the input
async function grabUrl() {
    //grab the url
    let urlInput = document.getElementById('url').value;

    //set the root data as url input
    root.setData(urlInput);
    
    //fetch the json
    await fetch(urlInput)
        .then(
            function(response) {
                //if error, console log it
                if (response.status !== 200) {
                    console.log('Error ' + response.status);
                    return;
                }
            
                //convert to json and move onto next function
                response.json().then(function(data) {
                    //move data to json object
                    json = data;
                    //convert json to a tree starting with the root node
                    convertData(root, json);
                    //set the parent of the tree-node object to be null
                    document.getElementById('root').setParent('null');
                    //start generating children
                    document.getElementById('root').startChildGeneration(root);
                    //set listeners onto all Lis
                    let uls = document.getElementById('root').getElementsByTagName('li');
                    for (let i = 0; i < uls.length; i++) {
                        uls[i].addEventListener('click', function() {
                            if (this.className.includes('active')) {
                                return this.className.replace(" active", "");
                            }
                            this.className += " active";

                        })
                    }
                    
                });
            }
        )
        //catch other errors
        .catch(function(err) {
            console.log('Fetch Error', err);
        });

    
}

function convertData(currentNode, data) {
    //loop over current data on the current node.
    Object.keys(data).forEach((x) => {
        //if the data string/number, can make an empty node
        if (typeof data[x] !== 'object') {
            currentNode.descendents[x] = new TreeNode2(x, data[x], currentNode);
        } 
        //if object, recursive the data creating new nodes until the data is all in a base type of string, number or empty
        else {
            //new empty node with just the name
            currentNode.descendents[x] = new TreeNode2(x, [], currentNode);
            //set a new pointer node
            let tempNode = currentNode.descendents[x];
            //loop over the object data pointing to temp node
            convertData(tempNode, data[x]);
        }

    })
}


//custom html component
class TreeNode extends HTMLElement {

    
    //check if the component is expanded
    get expand() {
        return this.hasAttribute('expand');
    }

    get node() {
        return this.getAttribute('node');
    }

    get parent() {
        return this.getAttribute('parent');
    }

    set parent(value) {
        this.setAttribute('parent', value);
    }
    
    setParent(value) {
        this.parent = value;
    }
    //set the expand option for component
    set expand(val) {
        if(val) {
            this.setAttribute('expand', '');
        } else {
            this.removeAttribute('expand');
        }
    }

    generateChildren(startNode) {
        let main = startNode; 
        
        let ul = document.createElement('ul');
        let li = document.createElement('li');
        let name = document.createElement('h3');
        name.innerText = 'Name: ' + main.name;
        li.append(name);
        ul.append(li);
        let li2 = document.createElement('li');
        let data = document.createElement('h5');
        data.innerText = 'Data: ' + main.data;
        li2.append(data);
        ul.append(li2);
    
        if (Object.keys(main.descendents).length > 0) {
            let ul2 = document.createElement('ul');
            Object.keys(main.descendents).forEach((x) => {
                let li3 = document.createElement('li');
                li3.append(this.generateChildren(main.descendents[x]));
                ul2.append(li3);
            })
            let li4 = document.createElement('li');
            let info = document.createElement('h5');
            info.innerText = 'Expand Children \n';
            li4.append(info);
            li4.append(ul2);
            ul.append(li4);
        }
    
        return ul;
    }

    startChildGeneration(startNode) {
        let x = this.generateChildren(startNode);
        this.append(x);
    }

    //switch the expand position by checking if it already exists
    switchExpand() {
        if(this.hasAttribute('expand')) {
            this.removeAttribute('expand');
        } else {
            this.setAttribute('expand', '')
        }
    } 

}


//define the node
customElements.define('tree-node', TreeNode);
