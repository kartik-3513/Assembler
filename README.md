# Assembler
Assembler for a small computer which translates assembly language into machine language. The computer architecture and organization of its components is given in docs. 

Course: Computer Architecture and Organization
Technologies: HTML, CSS, JavaScript

### Usage
Visit [this website](https://coa-project-051416.netlify.app/) and write your assembly code (see [Instruction set](https://coa-project-051416.netlify.app/docs.pdf))  in the code editor. Click **translate** button to get the translated machine code (see Assembler table). 
>Each instruction or pseudo-instruction must end with a semicolon “;” else it creates unexpected behaviour from the assembler like ignoring the instruction or interfering with the instructions following the instruction missing a semicolon. This assembler is facilitated with descriptive error messages which are printed in Machine code area itself.

### Example 

| Assembly language    | Machine language  |
| ----------- | ----------- |
| LOAD A, 4H; | 0100 0001 0000 0100
| LOAD B, 5H; |0100 0010 0000 0101
| ADD A, B;   | 0000 0000 0001 0110 |

Embedded code editor is supported by Codemirror Code editor. Visit https://codemirror.net/ to read their documentation.
