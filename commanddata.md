
# Command Data

Most of the commands have .json config file. (config/features/-command-.json)

This guide explains every data that you can change and need.

Sometimes there are more than the specified values, It's only style and no need to add


| Name         | Type         | Description         |
| :----------- | :----------- | :--------------: |
| responesEphemeral | boolean | Weather the command needs to reply "Privatly" or not |
| cooldown | Object: { enabled: boolean, time: number } | Has two values: enabled and time, If enabled is true there will be cooldown with the specified time, Please notice! the cooldown happens weather the execution of the command was successful or not |
| permission | Object: { type: "role" or "permission" or "", value: roleId or permission,  administratorBypass: boolean} | Has three values: type, value, administratorBypass. administratorBypass if enabled administrators can use the command no matter what |
| embedStates | Array of embeds | The style for every state in the command |
| messages | Array of string | The messages of the command |


