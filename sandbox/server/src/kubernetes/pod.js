import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId) {
  const podManifest = {
   metadata:{
    name:`sandbox-pod-${sandboxId}`,
    labels:{
     app:'sandbox',
     sandboxId:sandboxId
    }
   },
   spec:{
    containers:[
     {
      image:"template",
      imagePullPolicy:"IfNotPresent",
      name:"sandbox-deployment",
      port:[{containerPort:5173,name:"http"}],
      resources: {
                requests: {cpu: "125m",memory: "250Mi"},
                limits: {cpu: "250m",memory: "500Mi"}
       },
     },
    ]
   }
  };
  const response = await k8sCoreV1Api.createNamespacedPod({
   namespace:'default',
   body:podManifest
  })
  return response;
}
