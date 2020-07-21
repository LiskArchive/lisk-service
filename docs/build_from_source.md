# Build Lisk Service from Source

## Get sources with version control

In the contrary to the production version, make sure that the whole Git repository is cloned on your machine.

```bash
git clone https://github.com/LiskHQ/lisk-service.git

# Switch to the recent stable as a base
git checkout vx.y.z

# ...or use the development branch
git checkout development
```

Where `x.y.z` is the latest release version, ex. 1.0.1

## Next steps

Now you can use you favorite editor to make changes in the source files. Use the [PM2-based run instruction](run_with_pm2.md) to test your local build.

Once done you can build Docker images with `make build` and run them using the method from the main [README](../README.md).
