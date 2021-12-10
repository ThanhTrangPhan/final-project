import React, { useState } from "react";
import Head from "next/head";
import { useAsync } from "react-use";
import { useRouter } from "next/router";
import { useWallet } from "use-wallet";
import { useForm } from "react-hook-form";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  InputRightAddon,
  InputGroup,
  Alert,
  AlertIcon,
  AlertDescription,
  FormHelperText,
  Textarea,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getETHPrice, getETHPriceInUSD } from "../../lib/convert";

import factory from "../../service/factory";
import web3 from "../../service/web3";

export default function NewCampaign() {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
  });
  const router = useRouter();
  const [error, setError] = useState("");
  const wallet = useWallet();
  const [minContriInUSD, setMinContriInUSD] = useState();
  const [targetInUSD, setTargetInUSD] = useState();
  const [ETHPrice, setETHPrice] = useState(0);
  useAsync(async () => {
    try {
      const result = await getETHPrice();
      setETHPrice(result);
    } catch (error) {
      console.log(error);
    }
  }, []);
  async function onSubmit(data) {
    console.log(
      data.minimumContribution,
      data.campaignName,
      data.description,
      data.imageUrl,
      data.target
    );
    try {
      const accounts = await web3.eth.getAccounts();
      const transaction = await factory.methods
        .createCampaign(
          web3.utils.toWei(data.minimumContribution, "ether"),
          data.campaignName,
          data.description,
          data.imageUrl,
          web3.utils.toWei(data.target, "ether")
        )
        .send({
          from: accounts[0],
        });
      
      router.push("/");
    } catch (err) {
      setError(err.message);
      console.log(err);
    }
  }

  return (
    <div>
      <Head>
        <title>Chiến dịch mới</title>
        <meta name="description" content="Create New Campaign" />
        <link rel="icon" href="/icons8-kite-50.png" />
      </Head>
      <main>
        <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6}>
          <Text fontSize={"lg"} color={"blue.400"}>
            <ArrowBackIcon mr={2} />
            <NextLink href="/"> Quay lại trang chủ </NextLink>
          </Text>
          <Stack>
            <Heading fontSize={"4xl"}>Tạo 1 chiến dịch mới</Heading>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "blue.700")}
            boxShadow={"lg"}
            p={8}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl id="minimumContribution">
                  <FormLabel>Tối thiểu</FormLabel>
                  <InputGroup>
                    {" "}
                    <Input
                      type="number"
                      step="any"
                      {...register("minimumContribution", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setMinContriInUSD(Math.abs(e.target.value));
                      }}
                    />{" "}
                    <InputRightAddon children="ETH" />
                  </InputGroup>
                  {minContriInUSD ? (
                    <FormHelperText>
                      ~$ {getETHPriceInUSD(ETHPrice, minContriInUSD)}
                    </FormHelperText>
                  ) : null}
                </FormControl>
                <FormControl id="campaignName">
                  <FormLabel>Tên chiến dịch</FormLabel>
                  <Input
                    {...register("campaignName", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                <FormControl id="description">
                  <FormLabel>Mô tả</FormLabel>
                  <Textarea
                    {...register("description", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                <FormControl id="imageUrl">
                  <FormLabel>Link ảnh (tùy chọn) </FormLabel>
                  <Input
                    {...register("imageUrl", { required: false })}
                    isDisabled={isSubmitting}
                    type="url"
                  />
                </FormControl>
                <FormControl id="target">
                  <FormLabel>Gọi quỹ/vốn đạt mục tiêu: </FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      step="any"
                      {...register("target", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setTargetInUSD(Math.abs(e.target.value));
                      }}
                    />
                    <InputRightAddon children="ETH" />
                  </InputGroup>
                  {targetInUSD ? (
                    <FormHelperText>
                      ~$ {getETHPriceInUSD(ETHPrice, targetInUSD)}
                    </FormHelperText>
                  ) : null}
                </FormControl>

                {error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}> {error}</AlertDescription>
                  </Alert>
                ) : null}
                {errors.minimumContribution ||
                errors.name ||
                errors.description ||
                errors.target ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}>
                      {" "}
                      Chưa điền đầy đủ các trường bắt buộc
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Stack spacing={10}>
                  {wallet.status === "connected" ? (
                    <Button
                      bg={"blue.400"}
                      color={"white"}
                      _hover={{
                        bg: "blue.500",
                      }}
                      isLoading={isSubmitting}
                      type="submit"
                    >
                      Tạo 
                    </Button>
                  ) : (
                    <Stack spacing={3}>
                      <Button
                        color={"white"}
                        bg={"blue.400"}
                        _hover={{
                          bg: "blue.300",
                        }}
                        onClick={() => wallet.connect()}
                      >
                        Kết nối ví{" "}
                      </Button>
                      <Alert status="warning">
                        <AlertIcon />
                        <AlertDescription mr={2}>
                          Hãy kết nối ví của bạn
                        </AlertDescription>
                      </Alert>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </main>
    </div>
  );
}
