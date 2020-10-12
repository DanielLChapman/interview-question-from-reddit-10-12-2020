let json = {};
class TreeNode2 {
    constructor(name, data) {
        this.name = name;
        this.data = data;
        this.descendents = {};
    }
}

let root = new TreeNode2();

//grabs the url from the input
async function grabUrl() {
    let urlInput = document.getElementById('url').value;

    console.log(urlInput);

    await fetch(urlInput)
        .then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Error ' + response.status);
                    return;
                }
            
                //convert to json and move onto next function
                response.json().then(function(data) {
                    json = data;
                    convertData(root, json);
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error', err);
        });
}

function convertData(currentNode, data) {
    //loop over current data on the current node.
    Object.keys(data).forEach((x) => {
        //if the data string/number, can make an empty node
        if (typeof data[x] !== 'object') {
            currentNode.descendents[x] = new TreeNode2(x, data[x]);
        } 
        //if object, recursive the data creating new nodes until the data is all in a base type of string, number or empty
        else {
            //new empty node with just the name
            currentNode.descendents[x] = new TreeNode2(x, []);
            //set a new pointer node
            let tempNode = currentNode.descendents[x];
            //loop over the object data pointing to temp node
            convertData(tempNode, data[x]);
        }

    })

    console.log(root);
}



//custom html component
class TreeNode extends HTMLElement {

    //check if the component is expanded
    get expand() {
        return this.hasAttribute('expand');
    }

    //set the expand option for component
    set expand(val) {
        if(val) {
            this.setAttribute('expand', '')
        } else {
            this.removeAttribute('expand');
        }
    }

    //switch the expand position by checking if it already exists
    switchExpand() {
        if(this.hasAttribute('expand')) {
            this.removeAttribute('expand');
        } else {
            this.setAttribute('expand', '')
        }
    } 

    //constructor to add event listener click to switch the expansion
    constructor() {
        super();

        this.addEventListener('click', e => {
            this.switchExpand();
        })
    }
}


//define the node
customElements.define('tree-node', TreeNode);