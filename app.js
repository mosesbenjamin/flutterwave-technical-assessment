const express = require('express')
const Validator = require('jsonschema').Validator;

process.on('uncaughtException', err => {
    console.log(err.name, err.message)
    console.log('UNCAUGHT EXCEPTION! Shutting down...')
    process.exit(1)
})

const app = express()

app.use(express.json())

const port = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.status(200).json({
        'message': 'My Rule-validation API',
        'status': 'success',
        'data': {
            'name': 'Sunday Moses Benjamin',
            'github': '@mosesbenjamin',
            'email': 'sundaybenjamin08@gmail.com',
            'mobile': '07016487796',
            'twitter': '@_Mavewrick'
          }
    })
})

app.post('/validate-rule', (req, res) => {
    const {rule, data} = req.body

    // The rule and data fields are required.
    if(rule && data) {
        const v = new Validator();

        // rule shema
        // The rule field should be a valid JSON object and should contain the following required fields: field, condition, condition_value 
        const ruleSchema = {
            "id": "/Rule",
            "type": "object",
            "properties": {
                "field": {"type": "string"},
                "condition": {"$ref": "/condition"},
                "condition_value": {"type": "integer"}
            }
        }

        // The condition to use for validating the rule. Accepted condition values: eq, neq, gt, gte, contains
        const conditionSchema = {
            "id": "/condition",
            "type": "string",
            "enum": ["eq", "neq", "gt", "gte", "contains"]
            
        };

        // Provide reference to conditionSchema
        v.addSchema(conditionSchema, '/condition');

        // Validate rule field
        const ruleResponse = v.validate(rule, ruleSchema)

        // data shema
        // The data field can be any of: a valid JSON object, a valid array, a string
        const dataShema = {
            "oneOf": [
                { "type": "object" },
                { "type": "array" },
                { "type": "string" }
              ]
        }

        // Validate data field
        const dataResponse = v.validate(data, dataShema)

        // The rule field is passed as a number instead of a valid object
        if(ruleResponse.errors.length !==0){
            res.status(400).json({
                "message": "rule should be an object.",
                "status": "error",
                "data": null
            })
        }

        //  The data field is of the wrong type
        if(dataResponse.errors.length !==0){
            res.status(400).json({
                "message": "data should be an object, array or a string.",
                "status": "error",
                "data": null
            })
        }

        if (typeof data === 'object'){

            if (Array.isArray(data)){

                const filteredData = data.filter(d => d === rule.field)
                
                if(filteredData.length > 0){
                    res.status(200).json({
                        "message": `field ${rule.field} successfully validated.`,
                        "status": "success",
                        "data": {
                        "validation": {
                            "error": false,
                            "field": `${rule.field}`,
                            "field_value": `${filteredData[0]}`,
                            "condition": `${rule.condition}`,
                            "condition_value": `${rule.condition_value}`
                        }
                        }
                    })
                } else {
                        // The field specified in the rule object is missing from the data passed
                        return res.status(400).json({
                            "message": `field ${rule.field} is missing from data.`,
                            "status": "error",
                            "data": null
                        }) 
                } 
                
            } else {
                const dataFieldKeys = Object.keys(data)
                const dataFieldValues = Object.values(data)
                
                const filteredData = dataFieldKeys.filter(dataFieldKey => dataFieldKey === rule.field)
                    
                if(filteredData.length > 0){
                    if(typeof dataFieldValues[(dataFieldKeys.indexOf(filteredData[0]))] === 'number'){
                        if(rule.condition === 'gte'){
                            if(dataFieldValues[(dataFieldKeys.indexOf(filteredData[0]))] >= rule.condition_value) {
                                // gte rule is successfully validated
                                res.status(200).json({
                                    "message": `field ${rule.field} successfully validated.`,
                                    "status": "success",
                                    "data": {
                                    "validation": {
                                        "error": false,
                                        "field": `${rule.field}`,
                                        "field_value": `${dataFieldValues[dataFieldKeys.indexOf(filteredData[0])]}`,
                                        "condition": `${rule.condition}`,
                                        "condition_value": `${rule.condition_value}`
                                    }
                                    }
                                })
                            } else {
                                // The rule validation fails
                                res.status(400).json({
                                    "message": `field ${rule.field} failed validation.`,
                                    "status": "error",
                                    "data": {
                                      "validation": {
                                        "error": true,
                                        "field": `${rule.field}`,
                                        "field_value": `${dataFieldValues[dataFieldKeys.indexOf(filteredData[0])]}`,
                                        "condition": `${rule.condition}`,
                                        "condition_value": `${rule.condition_value}`
                                      }
                                    }
                                  })
                            }
                        } else if(rule.condition === 'gt'){
                            if(dataFieldValues[(dataFieldKeys.indexOf(filteredData[0]))] > rule.condition_value) {
                                // gt rule is successfully validated
                                res.status(200).json({
                                    "message": `field ${rule.field} successfully validated.`,
                                    "status": "success",
                                    "data": {
                                    "validation": {
                                        "error": false,
                                        "field": `${rule.field}`,
                                        "field_value": `${dataFieldValues[dataFieldKeys.indexOf(filteredData[0])]}`,
                                        "condition": `${rule.condition}`,
                                        "condition_value": `${rule.condition_value}`
                                    }
                                    }
                                })
                            } else {
                                // The rule validation fails
                                res.status(400).json({
                                    "message": `field ${rule.field} failed validation.`,
                                    "status": "error",
                                    "data": {
                                      "validation": {
                                        "error": true,
                                        "field": `${rule.field}`,
                                        "field_value": `${dataFieldValues[dataFieldKeys.indexOf(filteredData[0])]}`,
                                        "condition": `${rule.condition}`,
                                        "condition_value": `${rule.condition_value}`
                                      }
                                    }
                                  })
                            }
                        } else if(rule.condition === 'eq'){
                            if(dataFieldValues[(dataFieldKeys.indexOf(filteredData[0]))] === rule.condition_value) {
                                // eq rule is successfully validated
                                res.status(200).json({
                                    "message": `field ${rule.field} successfully validated.`,
                                    "status": "success",
                                    "data": {
                                    "validation": {
                                        "error": false,
                                        "field": `${rule.field}`,
                                        "field_value": `${dataFieldValues[dataFieldKeys.indexOf(filteredData[0])]}`,
                                        "condition": `${rule.condition}`,
                                        "condition_value": `${rule.condition_value}`
                                    }
                                    }
                                })
                            } else {
                                // The rule validation fails
                                res.status(400).json({
                                    "message": `field ${rule.field} failed validation.`,
                                    "status": "error",
                                    "data": {
                                      "validation": {
                                        "error": true,
                                        "field": `${rule.field}`,
                                        "field_value": `${dataFieldValues[dataFieldKeys.indexOf(filteredData[0])]}`,
                                        "condition": `${rule.condition}`,
                                        "condition_value": `${rule.condition_value}`
                                      }
                                    }
                                  })
                            }
                        } else if(rule.condition === 'neq'){
                            if(dataFieldValues[(dataFieldKeys.indexOf(filteredData[0]))] !== rule.condition_value) {
                                // neq rule is successfully validated
                                res.status(200).json({
                                    "message": `field ${rule.field} successfully validated.`,
                                    "status": "success",
                                    "data": {
                                    "validation": {
                                        "error": false,
                                        "field": `${rule.field}`,
                                        "field_value": `${dataFieldValues[dataFieldKeys.indexOf(filteredData[0])]}`,
                                        "condition": `${rule.condition}`,
                                        "condition_value": `${rule.condition_value}`
                                    }
                                    }
                                })
                            } else {
                                // The rule validation fails
                                res.status(400).json({
                                    "message": `field ${rule.field} failed validation.`,
                                    "status": "error",
                                    "data": {
                                      "validation": {
                                        "error": true,
                                        "field": `${rule.field}`,
                                        "field_value": `${dataFieldValues[dataFieldKeys.indexOf(filteredData[0])]}`,
                                        "condition": `${rule.condition}`,
                                        "condition_value": `${rule.condition_value}`
                                      }
                                    }
                                  })
                            }
                        }
                    }
                } else {
                        // The field specified in the rule object is missing from the data passed            
                        return res.status(400).json({
                            "message": `field ${rule.field} is missing from data.`,
                            "status": "error",
                            "data": null
                        }) 
                } 
            }
        } else if ( typeof data === 'string') {
            if(data !== rule.field){
                // The field specified in the rule object is missing from the data passed
                res.status(400).json({
                    "message": `field ${rule.field} is missing from data.`,
                    "status": "error",
                    "data": null
                })   
            } else {
                res.status(200).json({
                    "message": `field ${rule.field} successfully validated.`,
                    "status": "success",
                    "data": {
                    "validation": {
                        "error": false,
                        "field": `${rule.field}`,
                        "field_value": `${data}`,
                        "condition": `${rule.condition}`,
                        "condition_value": `${rule.condition_value}`
                    }
                    }
                })
            }
        }
 
    } else if (rule && data == undefined) {
        // Data isn't passed
        res.status(400).json({
            "message": "data is required.",
            "status": "error",
            "data": null
        })
    } else if (data && rule == undefined) {
        // Rule isn't passed
        res.status(400).json({
            "message": "rule is required.",
            "status": "error",
            "data": null
        })
    } else {
        // An invalid JSON payload is passed to the API
        res.status(400).json({
            "message": "Invalid JSON payload passed.",
            "status": "error",
            "data": null
        })  
    }
})

app.listen(port, ()=> {
    console.log(`App is running on port ${port}`)
})

process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('UNHANDLED REJECTION! Shutting down...')
    server.close(()=> {
        process.exit(1)
    })
})