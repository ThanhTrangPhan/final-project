import Head from "next/head";
import NextLink from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useWallet } from "use-wallet";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useState } from "react";
import { getETHPrice, getETHPriceInUSD } from "../../../../lib/convert";
import {
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
  FormErrorMessage,
  FormHelperText,
  Textarea,
} from "@chakra-ui/react";
import web3 from "../../../../service/web3";
import Campaign from "../../../../service/campaign";
import { useAsync } from "react-use";

export default function NewRequest() {
  const router = useRouter();
  const { id } = router.query;
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
  });
  const [error, setError] = useState("");
  const [inUSD, setInUSD] = useState();
  const [ETHPrice, setETHPrice] = useState(0);
  const wallet = useWallet();
  useAsync(async () => {
    try {
      const result = await getETHPrice();
      setETHPrice(result);
    } catch (error) {
      console.log(error);
    }
  }, []);
  async function onSubmit(data) {
    console.log(data);
    const campaign = Campaign(id);
    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods
        .createRequest(
          data.description,
          web3.utils.toWei(data.value, "ether"),
          data.recipient
        )
        .send({ from: accounts[0] });

      router.push(`/campaign/${id}/requests`);
    } catch (err) {
      setError(err.message);
      console.log(err);
    }
  }

  return (
    <div>
      <Head>
        <title>Tạo 1 yêu cầu rút quỹ </title>
        <meta name="description" content="Tạo 1 yêu cầu rút quỹ" />
        <link rel="icon" href="/icons8-kite-50.png" />
      </Head>
      <main>
        <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6}>
          <Text fontSize={"lg"} color={"blue.400"} justifyContent="center">
            <ArrowBackIcon mr={2} />
            <NextLink href={`/campaign/${id}/requests`}>
              Quay lại 
            </NextLink>
          </Text>
          <Stack>
            <Heading fontSize={"4xl"}>Tạo yêu cầu rút quỹ </Heading>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "blue.700")}
            boxShadow={"lg"}
            p={8}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl id="description">
                  <FormLabel>Cho tiết </FormLabel>
                  <Textarea
                    {...register("description", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                <FormControl id="value">
                  <FormLabel>Số lượng ETH </FormLabel>
                  <InputGroup>
                    {" "}
                    <Input
                      type="number"
                      {...register("value", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setInUSD(Math.abs(e.target.value));
                      }}
                      step="any"
                    />{" "}
                    <InputRightAddon children="ETH" />
                  </InputGroup>
                  {inUSD ? (
                    <FormHelperText>
                      ~$ {getETHPriceInUSD(ETHPrice, inUSD)}
                    </FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl id="recipient">
                  <FormLabel htmlFor="recipient">
                    Địa chỉ ví người nhận 
                  </FormLabel>
                  <Input
                    name="recipient"
                    {...register("recipient", {
                      required: true,
                    })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                {errors.description || errors.value || errors.recipient ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}>
                      {" "}
                      Mọi trường thông tin cần điền đầy đủ
                    </AlertDescription>
                  </Alert>
                ) : null}
                {error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}> {error}</AlertDescription>
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
                      Tạo yêu cầu
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
                        Liên kết ví {" "}
                      </Button>
                      <Alert status="warning">
                        <AlertIcon />
                        <AlertDescription mr={2}>
                          Hãy liên kết ví của bạn 
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
