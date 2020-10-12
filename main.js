let json = {};

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
                    convertData(json);
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
}

function convertData(data) {
    console.log(data);
}

class TreeNode2 {
    constructor(name, data) {
        this.name = name;
        this.data = data;
        this.descendents = [];
    }
}

function convertJSONToTree(jsondata) {

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