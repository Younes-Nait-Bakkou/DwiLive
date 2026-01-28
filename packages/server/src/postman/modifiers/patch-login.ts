import postman from "postman-collection";

const { Item, ItemGroup, Event, Script, RequestBody } = postman;

export function patchLoginRequest(collection: postman.ItemGroup<postman.Item>) {
    const authFolder = collection.items.find(
        (f) => f.name.toLowerCase() === "auth",
        undefined,
    );

    if (
        authFolder &&
        ItemGroup.isItemGroup(authFolder) &&
        authFolder instanceof ItemGroup
    ) {
        const loginRequest = authFolder.items.find(
            (r) => r.name.toLowerCase() === "login",
            undefined,
        );

        if (
            loginRequest &&
            Item.isItem(loginRequest) &&
            loginRequest instanceof Item
        ) {
            loginRequest.events.add(
                new Event({
                    listen: "test",
                    script: new Script({
                        exec: [
                            "if (pm.response.code === 200) {",
                            "    const response = pm.response.json();",
                            '    pm.environment.set("user_id", response.user.id);',
                            '    console.log("user_id set to: " + response.user.id);',
                            "}",
                        ],
                        type: "text/javascript",
                    }),
                }),
            );

            loginRequest.request.body = new RequestBody({
                mode: "raw",
                raw: JSON.stringify(
                    {
                        username: "{{username}}",
                        password: "{{password}}",
                    },
                    null,
                    2,
                ),
            });
        } else {
            console.warn(
                '⚠️ Could not find "Login" request to add test script.',
            );
        }
    } else {
        console.warn('⚠️ Could not find "Auth" folder to add test script.');
    }
}
