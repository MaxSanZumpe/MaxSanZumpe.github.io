class game_state {
    constructor() 
    {
        this.turn = 0;
        this.phase = new Array( 2).fill(0);
        this.board = new Array(24).fill(0);
        this.neigh = Array.from({ length: 24 }, () => Array.from({ length: 4 }, () => new Array(2).fill(-1)));
        this.num_stones = new Array( 2).fill(0);
        this.dots = document.querySelectorAll('.dot');
    }

    ring(index)
    {
        return Math.floor(index / 8);
    }

    position(index)
    {
        return index % 8;
    }

    index(ring, position)
    {
        return 8*ring + position;
    }

    init_board()
    {   
        for (let i = 0; i < this.neigh.length; i++) {
            let r = this.ring(i);
            let p = this.position(i);

            this.neigh[i][0][0] = this.index(r, (p + 7) % 8);
            this.neigh[i][1][0] = this.index(r, (p + 1) % 8);

            this.neigh[i][0][1] = this.index(r, (p + 1) % 8);
            this.neigh[i][1][1] = this.index(r, (p + 7) % 8);

            if (p % 2 === 0) {
                this.neigh[i][0][1] = this.index(r, (p + 6) % 8);
                this.neigh[i][1][1] = this.index(r, (p + 2) % 8);
            } else {
                this.neigh[i][0][1] = this.index(r, (p + 1) % 8);
                this.neigh[i][1][1] = this.index(r, (p + 7) % 8);

                switch (r) {
                    case 0:
                        this.neigh[i][2][0] = this.index(r + 1, p);
                        this.neigh[i][2][1] = this.index(r + 2, p);
                    case 1:
                        this.neigh[i][2][0] = this.index(r - 1, p);
                        this.neigh[i][2][1] = this.index(r + 1, p);

                        this.neigh[i][3][0] = this.index(r + 1, p);
                        this.neigh[i][3][1] = this.index(r - 1, p);
                    case 2:
                        this.neigh[i][2][0] = this.index(r - 1, p);
                        this.neigh[i][2][1] = this.index(r - 2, p);
                }        
            }    
            
        }
    }
    
    get_positions(id)
    {
        let free = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === id) {
                free.push(i); 
            }
        }
        return free;
    }
    
    get_free_neighbours(index)
    {
        let ret = []
        for (let i = 0; i < this.neigh[index].length; i++) {
            if (this.board[this.neigh[index][i][0]] === 0) {
                ret.push(this.neigh[index][i][0]);
            }
        }

        return ret;
    }

    add_stone(index)
    {   
        let map = ["white", "black"]
        this.num_stones[this.turn] += 1;
        this.board[index] = this.turn + 1;
        this.dots[index].style.backgroundColor = map[this.turn]; 
        this.dots[index].style.borderColor = map[this.turn];
        this.dots[index].style.borderWidth = "10px";
        this.dots[index].style.zIndex = "20px"
    }

    del_stone(index)
    {
        this.board[index] = 0;
        this.num_stones[this.turn] -= 1;
        this.dots[index].style.backgroundColor = "black"; 
        this.dots[index].style.borderColor = "black";
        this.dots[index].style.borderWidth = "3px";
        this.dots[index].style.zIndex = "10px"
    }

    update_phase() {
        if (this.num_stones[0] === 3) { this.phase[0] = 2 };
        if (this.num_stones[1] === 3) { this.phase[1] = 2 };

        if (this.num_stones[0] <   3) { return true };
        if (this.num_stones[1] <   3) { return true };

        return false
    }

    check_for_end() {
        if (this.num_stones[0] <   3) { return true };
        if (this.num_stones[1] <   3) { return true };
    }

    check_for_muele(index) {
        let search = Array(3).fill(0);
        search[0] = this.board[index];

        
        for (let i = 0; i < 4; i++) {
            search[1] = this.board[this.neigh[index][i][0]];
            search[2] = this.board[this.neigh[index][i][1]];

            if (search.every(value => value === search[0])) { return true }
        };

        return false
    }
}


function reset_style(dots, arr)
{
    dots.forEach((dot, index) => {
        if (arr.includes(index)) {
            dot.style.borderColor = "black";
            dot.style.cursor = null;
        }
    });
}


function get_user_click(dots, arr) 
{   
    return new Promise((resolve) => {
        function handleClick(event) 
        {
            const clickedDot = event.target;
            const index = Array.from(dots).indexOf(clickedDot);

            if (arr.includes(index)) {
                dots.forEach(dot => {
                    dot.removeEventListener('click', handleClick);
                });
            }
            
            resolve(index);
        }
            
        dots.forEach((dot, index) => {
            if (arr.includes(index)) {
                dot.addEventListener('click', handleClick);
            }
        });
    });
}

async function get_user_stone_placement(dots, arr, state) 
{
    let click;

    dots.forEach((dot, index) => {
        if (arr.includes(index)) {
            dot.style.borderColor = "blue";
            dot.style.cursor = "pointer";
        }
    });

    click = await get_user_click(dots, arr);
    reset_style(dots, arr);
    state.add_stone(click);

    if (state.phase[state.turn] < 1) { 
        let muele = state.check_for_muele(click);
    
        if (muele === true) {
            let click3 = 0;
            state.turn ^= 1;
            let arr3 = state.get_positions(state.turn + 1);
    
            console.log(state.turn + 1)
            console.log(arr3)

            dots.forEach((dot, index) => {
                if (arr3.includes(index)) {
                    dot.style.cursor = "pointer";
                }
            });

            click3 = await get_user_click(dots, arr3);

            dots.forEach((dot, index) => {
                if (arr3.includes(index)) {
                    dot.style.cursor = null;
                }
            });

            
            state.del_stone(click3);
            state.turn ^= 1;
        }
    }

    return click;
}

async function get_user_stone_move(dots, arr, state) 
{
    let click1;
    let empty = true;

    let arr2 = []
    while (empty === true) {

        dots.forEach((dot, index) => {
            if (arr.includes(index)) {
                dot.style.cursor = "pointer";
            }
        });

        click1 = await get_user_click(dots, arr);

        dots.forEach((dot, index) => {
            if (arr.includes(index)) {
                dot.style.cursor = null;
            }
        });

        if (state.phase[state.turn] < 2) {
            arr2 = state.get_free_neighbours(click1);
        } else {
            arr2 = state.get_positions(0);
        }

        empty = arr2.length === 0
    }

    let click2 = 0;
    click2 = await get_user_stone_placement(dots, arr2, state);
    state.del_stone(click1);

    let muele = state.check_for_muele(click2);
    
    if (muele === true) {
        let click3 = 0;
        state.turn ^= 1;
        let arr3 = state.get_positions(state.turn + 1);
 
        console.log(state.turn + 1)
        console.log(arr3)

        dots.forEach((dot, index) => {
            if (arr3.includes(index)) {
                dot.style.cursor = "pointer";
            }
        });

        click3 = await get_user_click(dots, arr3);

        dots.forEach((dot, index) => {
            if (arr3.includes(index)) {
                dot.style.cursor = null;
            }
        });

        
        state.del_stone(click3);
        state.turn ^= 1;
    }
}

async function game_loop(state)
{   
    let i = 0;
    let stop1 = false;
    let map = ["White", "Black"]
    let early = false;
    while (stop1 === false) {
        showMessage(`${map[state.turn]}'s turn!`);
        await get_user_stone_placement(state.dots, state.get_positions(0), state);

        state.turn ^= 1;  
        i++;

        if (i >= 18) { stop1 = true } 
    }

    state.phase[0] = 1;
    state.phase[1] = 1;


    while (early === false) {  
        showMessage(`${map[state.turn]}'s turn!`);  
        await get_user_stone_move(state.dots, state.get_positions(state.turn + 1), state)

        if (state.update_phase()) {
            showMessage(`${map[state.turn]} wins!`);
            break;
        }
        
        state.turn ^= 1;  
        i++;
    }
}

function showMessage(htmlContent) {
    const container = document.getElementById('message');
    container.innerHTML = htmlContent; 
}


state = new game_state;
state.init_board();
game_loop(state);


