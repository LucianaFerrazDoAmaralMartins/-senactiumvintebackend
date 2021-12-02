// importação do módulo express para gerenciar o servidor de aplicação em node
const express = require("express");

// importação do módulo do cors para nos ajudar no 
// trato com protocolos de requisição diferentes, tais 
// como: http; https; file; ftp
const cors = require("cors"); 
// importação do módulo do mysql
const mysql = require("mysql"); 
// importação do módulo do jsonwebtoken para nos ajudar 
// a trabalhar com seção segura
const jwt = require("jsonwebtoken");
// para criptografar as senhas será utilizado o bcrypt 
// vamos importar o módulo
const bcrypt = require ("bcrypt");

// Criando uma instância do servidor para carregá-lo
// Faremos isso usando a constante app
const app = express();

// configurar o servidor express para aceitar dados em formato json. 
app.use(express.json());

//  configurar o servidor para lidar com as requisições 
// de várias origens. Para isso iremos usar o cors
app.use(cors());

// configuração para a comunicação com o banco de dados 
const con = mysql.createConnection({
    host:"localhost", 
    user:"luciana", 
    password:"senac@123", 
    database:"ti0120db",
    port:"3306"
}); 
//  executar a conexão com o banco de dados 
con.connect((erro)=>{
    if(erro){
        console.error(`Erro ao tentar carregar o servidor de banco de dados ->${erro}`);
        return;
    }
    console.log(`Servidor de banco de dados conectado -> ${con.threadId}`)
});

// vamos criar as rotas com os endpoints para reaklizar o gerenciamento 
// dos dados dos clientes
app.get("/api/cliente/listar",(req,res)=>{
// vamos consultar os clientes cadastrados em banco e retornar os dados 
const result = con.query("Select * from tbcliente",(erro,result)=>{
    if(erro){
        return res.status(400).send({output:`Erro ao tentar carregar dados->${erro}`});
    }
    res.status(200).send({output:result});
});

});
// listar cliente po ID 
app.get("/api/cliente/listar/:id",(req,res)=>{
    con.query("Select * from tbcliente where idcliente=?",[req.params.id],(erro,result)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar localizar o cliente->${erro}`});
        }
        res.status(200).send({output:result});
    });
});

// inserção no banco de dados 
app.post ("/api/cliente/cadastro",(req,res)=>{
    // antes de cadastrar tem que criptografar a senha, com 10 saltos  
    bcrypt.hash(req.body.senha,10,(erro,result)=>{
        if(erro){
            return res.status(503).send({output:`Erro interno ao gerar a senha ->${erro}`});
        }
        req.body.senha = result;
   
    con.query("INSERT INTO tbcliente SET ?",[req.body],(erro,result)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar cadastrar -> ${erro}`});
        }
        res.status(201).send({output:`Cadastro realizado`, payload:result});
});
});
});
//  rota do LOGIN
app.post("/api/cliente/login",(req,res)=>{
    const us = req.body.usuario;
    const sh = req.body.senha;

    
    con.query("Select * from tbcliente where usuario=?",[us],(erro,result)=>{
        if(erro){
            return res.status(400).send({ output:`Erro ao tentar logar -> ${erro}`})
        }
        if(!result){
            return res.status(404).send({output:"Usuário não localizado"});
        }

        bcrypt.compare(sh,result[0].senha,(erro,igual)=>{
            if(erro){
                return res.status(503).send({output:`Erro interno->${erro}`});
            }
            if(!igual){
                return res.status(400).send({output:`Sua senha está incorreta`});
            }
            // payload = dados importantes no caso os de perfil
            res.status(200).send({output:`Logado`,payload:result});
        });
    });
});
app.put("/api/cliente/atualizar/:id",(req,res)=>{
con.query("Update tbcliente set ? where idcliente=?",[req.body,req.params.id],(erro,result)=>{
if(erro){
    return res.status(400).send({output:`Erro ao tentar atualizar -> ${erro}`});
}
res.status(200).send({output:`Dados atualizados`,payload:result});
});
});
app.delete("/api/cliente/apagar/:id",(req,res)=>{
    con.query("Delete from tbcliente where idcliente=?",[req.params.id],(erro,result)=>{
        if(erro){
           return res.status(400).send({output:`Erro ao tentar apagar->${erro}`});
        }
        res.status(204).send({});
    });
});
app.listen(3000,()=>console.log(`Servidor online em http://localhost:3000`));