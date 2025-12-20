---
title: Hamburg - Advent of Sysadmin 2025 - 12/06
tags: [devops, ctf]
date: 2025-12-06
---

> This is part of Sad Servers' [Advent of Sysadmin 2025](https://sadservers.com/advent) series.
>
> I'm doing each challenge every day and I'm publishing a quick write up for each one every day.
>
> 12-06: JQ filtering
>
> Spoiler alert! This gives the solution to the challenge.
> If you want to do it on your own, stop reading.

---

**Scenario:** "Hamburg": Find the AWS EC2 volume

**Level:** Easy

**Description:** We have a lot of AWS EC2 instances and EBS volumes, the description of which volumes we have saved to a file with: `aws ec2 describe-volumes > aws-volumes.json`.
One of the volumes attached to an ec2 instance contains important data and we need to identify which instance is attached to (its ID), but we only remember these characteristics: gp3, created before 31/09/2025 , Size < 64 , Iops < 1500, Throughput > 300.

Find the correct instance and put its "InstanceId" into the _~/mysolution_ file, e.g.: `echo "i-00000000000000000" > ~/mysolution`

**Test:** Running `md5sum /home/admin/mysolution` returns `e7e34463823bf7e39358bf6bb24336d8` (we also accept the file without a new line at the end).

The "Check My Solution" button runs the script _/home/admin/agent/check.sh_, which you can see and execute.

**Time to Solve:** 30 minutes.

**OS:** Debian 13

**Root (sudo) Access:** Yes

---

Just by reading the challenge description, I knew I had to work with `jq` to find the answer.

Before launching the challenge, I started by reading the output structure of the AWS CLI `describe-volumes` command here: [describe-volumes — AWS CLI 2.32.11 Command Reference](https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-volumes.html#output)

I ended up preparing my jq filter like this to match the search criteria:

- VolumeType == gp3
- CreateTime < 2025-09-31T00:00:002
- Size < 64
- Iops < 1500
- Throughput > 300

```bash
jq '.Volumes[] | select(.VolumeType == "gp3" and .Size < 64 and .Iops < 1500 and .Throughput > 300 and .CreateTime < "2025-09-31T00:00:002")'
```

```bash
cat aws-volumes.json | jq '.Volumes[] | select(.VolumeType == "gp3" and .Size < 64 and .Iops < 1500 and .Throughput > 300 and .CreateTime < "2025-09-31T00:00:002")'
{
  "AvailabilityZoneId": "use2-az2",
  "Iops": 1000,
  "VolumeType": "gp3",
  "MultiAttachEnabled": false,
  "Throughput": 500,
  "Operator": {
    "Managed": false
  },
  "VolumeId": "vol-29d115ef9c3944f29",
  "Size": 8,
  "SnapshotId": "snap-4d14b6dc50854a9cb",
  "AvailabilityZone": "us-east-2c",
  "State": "in-use",
  "CreateTime": "2025-09-29T16:43:18.004823Z",
  "Attachments": [
    {
      "DeleteOnTermination": true,
      "VolumeId": "vol-29d115ef9c3944f29",
      "InstanceId": "i-371822c092b2470da",
      "Device": "/dev/xvdc",
      "State": "attached",
      "AttachTime": "2025-09-29T17:41:18.004823Z"
    }
  ],
  "Encrypted": false
}
{
  "AvailabilityZoneId": "use2-az3",
  "Iops": 1000,
  "VolumeType": "gp3",
  "MultiAttachEnabled": false,
  "Throughput": 500,
  "Operator": {
    "Managed": false
  },
  "VolumeId": "vol-99646e602c6e4b92a",
  "Size": 16,
  "SnapshotId": "snap-27b0fb199d294889b",
  "AvailabilityZone": "us-east-2a",
  "State": "available",
  "CreateTime": "2025-09-29T01:21:18.004823Z",
  "Attachments": [],
  "Encrypted": false
}

```

I confirmed this command was working as expected. And then, I had to select the attachment instance ID to get the answer:

```bash
cat aws-volumes.json | jq '.Volumes[] | select(.VolumeType == "gp3" and .Size < 64 and .Iops < 1500 and .Throughput > 300 and .CreateTime < "2025-09-31T00:00:002") | .Attachments[].InstanceId'
```

Redirect that into the file `mysolution` with the `--raw-output` argument for jq. And that's it!

```bash
cat aws-volumes.json | jq --raw-output '.Volumes[] | select(.VolumeType == "gp3" and .Size < 64 and .Iops < 1500 and .Throughput > 300 and .CreateTime < "2025-09-31T00:00:002") | .Attachments[].InstanceId' > mysolution
```

A quick and easy one! 🚩
